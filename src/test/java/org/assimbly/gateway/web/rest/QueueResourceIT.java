package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.Queue;
import org.assimbly.gateway.repository.QueueRepository;
import org.assimbly.gateway.service.QueueService;
import org.assimbly.gateway.service.dto.QueueDTO;
import org.assimbly.gateway.service.mapper.QueueMapper;
import org.assimbly.gateway.web.rest.errors.ExceptionTranslator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.util.List;

import static org.assimbly.gateway.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link QueueResource} REST controller.
 */
@SpringBootTest(classes = GatewayApp.class)
public class QueueResourceIT {

    private static final Integer DEFAULT_ITEMS_ON_PAGE = 1;
    private static final Integer UPDATED_ITEMS_ON_PAGE = 2;

    private static final Integer DEFAULT_REFRESH_INTERVAL = 1;
    private static final Integer UPDATED_REFRESH_INTERVAL = 2;

    private static final String DEFAULT_SELECTED_COLUMN = "AAAAAAAAAA";
    private static final String UPDATED_SELECTED_COLUMN = "BBBBBBBBBB";

    private static final String DEFAULT_ORDER_COLUMN = "AAAAAAAAAA";
    private static final String UPDATED_ORDER_COLUMN = "BBBBBBBBBB";

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private QueueMapper queueMapper;

    @Autowired
    private QueueService queueService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Autowired
    private Validator validator;

    private MockMvc restQueueMockMvc;

    private Queue queue;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final QueueResource queueResource = new QueueResource(queueService);
        this.restQueueMockMvc = MockMvcBuilders.standaloneSetup(queueResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Queue createEntity(EntityManager em) {
        Queue queue = new Queue()
            .itemsOnPage(DEFAULT_ITEMS_ON_PAGE)
            .refreshInterval(DEFAULT_REFRESH_INTERVAL)
            .selectedColumn(DEFAULT_SELECTED_COLUMN)
            .orderColumn(DEFAULT_ORDER_COLUMN);
        return queue;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Queue createUpdatedEntity(EntityManager em) {
        Queue queue = new Queue()
            .itemsOnPage(UPDATED_ITEMS_ON_PAGE)
            .refreshInterval(UPDATED_REFRESH_INTERVAL)
            .selectedColumn(UPDATED_SELECTED_COLUMN)
            .orderColumn(UPDATED_ORDER_COLUMN);
        return queue;
    }

    @BeforeEach
    public void initTest() {
        queue = createEntity(em);
    }

    @Test
    @Transactional
    public void createQueue() throws Exception {
        int databaseSizeBeforeCreate = queueRepository.findAll().size();

        // Create the Queue
        QueueDTO queueDTO = queueMapper.toDto(queue);
        restQueueMockMvc.perform(post("/api/queues")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(queueDTO)))
            .andExpect(status().isCreated());

        // Validate the Queue in the database
        List<Queue> queueList = queueRepository.findAll();
        assertThat(queueList).hasSize(databaseSizeBeforeCreate + 1);
        Queue testQueue = queueList.get(queueList.size() - 1);
        assertThat(testQueue.getItemsOnPage()).isEqualTo(DEFAULT_ITEMS_ON_PAGE);
        assertThat(testQueue.getRefreshInterval()).isEqualTo(DEFAULT_REFRESH_INTERVAL);
        assertThat(testQueue.getSelectedColumn()).isEqualTo(DEFAULT_SELECTED_COLUMN);
        assertThat(testQueue.getOrderColumn()).isEqualTo(DEFAULT_ORDER_COLUMN);
    }

    @Test
    @Transactional
    public void createQueueWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = queueRepository.findAll().size();

        // Create the Queue with an existing ID
        queue.setId(1L);
        QueueDTO queueDTO = queueMapper.toDto(queue);

        // An entity with an existing ID cannot be created, so this API call must fail
        restQueueMockMvc.perform(post("/api/queues")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(queueDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Queue in the database
        List<Queue> queueList = queueRepository.findAll();
        assertThat(queueList).hasSize(databaseSizeBeforeCreate);
    }


    @Test
    @Transactional
    public void getAllQueues() throws Exception {
        // Initialize the database
        queueRepository.saveAndFlush(queue);

        // Get all the queueList
        restQueueMockMvc.perform(get("/api/queues?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(queue.getId().intValue())))
            .andExpect(jsonPath("$.[*].itemsOnPage").value(hasItem(DEFAULT_ITEMS_ON_PAGE)))
            .andExpect(jsonPath("$.[*].refreshInterval").value(hasItem(DEFAULT_REFRESH_INTERVAL)))
            .andExpect(jsonPath("$.[*].selectedColumn").value(hasItem(DEFAULT_SELECTED_COLUMN)))
            .andExpect(jsonPath("$.[*].orderColumn").value(hasItem(DEFAULT_ORDER_COLUMN)));
    }
    
    @Test
    @Transactional
    public void getQueue() throws Exception {
        // Initialize the database
        queueRepository.saveAndFlush(queue);

        // Get the queue
        restQueueMockMvc.perform(get("/api/queues/{id}", queue.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(queue.getId().intValue()))
            .andExpect(jsonPath("$.itemsOnPage").value(DEFAULT_ITEMS_ON_PAGE))
            .andExpect(jsonPath("$.refreshInterval").value(DEFAULT_REFRESH_INTERVAL))
            .andExpect(jsonPath("$.selectedColumn").value(DEFAULT_SELECTED_COLUMN))
            .andExpect(jsonPath("$.orderColumn").value(DEFAULT_ORDER_COLUMN));
    }

    @Test
    @Transactional
    public void getNonExistingQueue() throws Exception {
        // Get the queue
        restQueueMockMvc.perform(get("/api/queues/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateQueue() throws Exception {
        // Initialize the database
        queueRepository.saveAndFlush(queue);

        int databaseSizeBeforeUpdate = queueRepository.findAll().size();

        // Update the queue
        Queue updatedQueue = queueRepository.findById(queue.getId()).get();
        // Disconnect from session so that the updates on updatedQueue are not directly saved in db
        em.detach(updatedQueue);
        updatedQueue
            .itemsOnPage(UPDATED_ITEMS_ON_PAGE)
            .refreshInterval(UPDATED_REFRESH_INTERVAL)
            .selectedColumn(UPDATED_SELECTED_COLUMN)
            .orderColumn(UPDATED_ORDER_COLUMN);
        QueueDTO queueDTO = queueMapper.toDto(updatedQueue);

        restQueueMockMvc.perform(put("/api/queues")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(queueDTO)))
            .andExpect(status().isOk());

        // Validate the Queue in the database
        List<Queue> queueList = queueRepository.findAll();
        assertThat(queueList).hasSize(databaseSizeBeforeUpdate);
        Queue testQueue = queueList.get(queueList.size() - 1);
        assertThat(testQueue.getItemsOnPage()).isEqualTo(UPDATED_ITEMS_ON_PAGE);
        assertThat(testQueue.getRefreshInterval()).isEqualTo(UPDATED_REFRESH_INTERVAL);
        assertThat(testQueue.getSelectedColumn()).isEqualTo(UPDATED_SELECTED_COLUMN);
        assertThat(testQueue.getOrderColumn()).isEqualTo(UPDATED_ORDER_COLUMN);
    }

    @Test
    @Transactional
    public void updateNonExistingQueue() throws Exception {
        int databaseSizeBeforeUpdate = queueRepository.findAll().size();

        // Create the Queue
        QueueDTO queueDTO = queueMapper.toDto(queue);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restQueueMockMvc.perform(put("/api/queues")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(queueDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Queue in the database
        List<Queue> queueList = queueRepository.findAll();
        assertThat(queueList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteQueue() throws Exception {
        // Initialize the database
        queueRepository.saveAndFlush(queue);

        int databaseSizeBeforeDelete = queueRepository.findAll().size();

        // Delete the queue
        restQueueMockMvc.perform(delete("/api/queues/{id}", queue.getId())
            .accept(TestUtil.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Queue> queueList = queueRepository.findAll();
        assertThat(queueList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
