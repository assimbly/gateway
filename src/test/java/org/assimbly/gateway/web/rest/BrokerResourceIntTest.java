package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.Broker;
import org.assimbly.gateway.repository.BrokerRepository;
import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.service.dto.BrokerDTO;
import org.assimbly.gateway.service.mapper.BrokerMapper;
import org.assimbly.gateway.web.rest.errors.ExceptionTranslator;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
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
 * Test class for the BrokerResource REST controller.
 *
 * @see BrokerResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class BrokerResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_CONFIGURATION_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_CONFIGURATION_TYPE = "BBBBBBBBBB";

    private static final Boolean DEFAULT_AUTO_START = false;
    private static final Boolean UPDATED_AUTO_START = true;

    @Autowired
    private BrokerRepository brokerRepository;

    @Autowired
    private BrokerMapper brokerMapper;

    @Autowired
    private BrokerService brokerService;

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

    private MockMvc restBrokerMockMvc;

    private Broker broker;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final BrokerResource brokerResource = new BrokerResource(brokerService);
        this.restBrokerMockMvc = MockMvcBuilders.standaloneSetup(brokerResource)
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
    public static Broker createEntity(EntityManager em) {
        Broker broker = new Broker()
            .name(DEFAULT_NAME)
            .type(DEFAULT_TYPE)
            .configurationType(DEFAULT_CONFIGURATION_TYPE)
            .autoStart(DEFAULT_AUTO_START);
        return broker;
    }

    @Before
    public void initTest() {
        broker = createEntity(em);
    }

    @Test
    @Transactional
    public void createBroker() throws Exception {
        int databaseSizeBeforeCreate = brokerRepository.findAll().size();

        // Create the Broker
        BrokerDTO brokerDTO = brokerMapper.toDto(broker);
        restBrokerMockMvc.perform(post("/api/brokers")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(brokerDTO)))
            .andExpect(status().isCreated());

        // Validate the Broker in the database
        List<Broker> brokerList = brokerRepository.findAll();
        assertThat(brokerList).hasSize(databaseSizeBeforeCreate + 1);
        Broker testBroker = brokerList.get(brokerList.size() - 1);
        assertThat(testBroker.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testBroker.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testBroker.getConfigurationType()).isEqualTo(DEFAULT_CONFIGURATION_TYPE);
        assertThat(testBroker.isAutoStart()).isEqualTo(DEFAULT_AUTO_START);
    }

    @Test
    @Transactional
    public void createBrokerWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = brokerRepository.findAll().size();

        // Create the Broker with an existing ID
        broker.setId(1L);
        BrokerDTO brokerDTO = brokerMapper.toDto(broker);

        // An entity with an existing ID cannot be created, so this API call must fail
        restBrokerMockMvc.perform(post("/api/brokers")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(brokerDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Broker in the database
        List<Broker> brokerList = brokerRepository.findAll();
        assertThat(brokerList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllBrokers() throws Exception {
        // Initialize the database
        brokerRepository.saveAndFlush(broker);

        // Get all the brokerList
        restBrokerMockMvc.perform(get("/api/brokers?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(broker.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].configurationType").value(hasItem(DEFAULT_CONFIGURATION_TYPE.toString())))
            .andExpect(jsonPath("$.[*].autoStart").value(hasItem(DEFAULT_AUTO_START.booleanValue())));
    }
    
    @Test
    @Transactional
    public void getBroker() throws Exception {
        // Initialize the database
        brokerRepository.saveAndFlush(broker);

        // Get the broker
        restBrokerMockMvc.perform(get("/api/brokers/{id}", broker.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(broker.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.configurationType").value(DEFAULT_CONFIGURATION_TYPE.toString()))
            .andExpect(jsonPath("$.autoStart").value(DEFAULT_AUTO_START.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingBroker() throws Exception {
        // Get the broker
        restBrokerMockMvc.perform(get("/api/brokers/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateBroker() throws Exception {
        // Initialize the database
        brokerRepository.saveAndFlush(broker);

        int databaseSizeBeforeUpdate = brokerRepository.findAll().size();

        // Update the broker
        Broker updatedBroker = brokerRepository.findById(broker.getId()).get();
        // Disconnect from session so that the updates on updatedBroker are not directly saved in db
        em.detach(updatedBroker);
        updatedBroker
            .name(UPDATED_NAME)
            .type(UPDATED_TYPE)
            .configurationType(UPDATED_CONFIGURATION_TYPE)
            .autoStart(UPDATED_AUTO_START);
        BrokerDTO brokerDTO = brokerMapper.toDto(updatedBroker);

        restBrokerMockMvc.perform(put("/api/brokers")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(brokerDTO)))
            .andExpect(status().isOk());

        // Validate the Broker in the database
        List<Broker> brokerList = brokerRepository.findAll();
        assertThat(brokerList).hasSize(databaseSizeBeforeUpdate);
        Broker testBroker = brokerList.get(brokerList.size() - 1);
        assertThat(testBroker.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testBroker.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testBroker.getConfigurationType()).isEqualTo(UPDATED_CONFIGURATION_TYPE);
        assertThat(testBroker.isAutoStart()).isEqualTo(UPDATED_AUTO_START);
    }

    @Test
    @Transactional
    public void updateNonExistingBroker() throws Exception {
        int databaseSizeBeforeUpdate = brokerRepository.findAll().size();

        // Create the Broker
        BrokerDTO brokerDTO = brokerMapper.toDto(broker);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBrokerMockMvc.perform(put("/api/brokers")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(brokerDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Broker in the database
        List<Broker> brokerList = brokerRepository.findAll();
        assertThat(brokerList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteBroker() throws Exception {
        // Initialize the database
        brokerRepository.saveAndFlush(broker);

        int databaseSizeBeforeDelete = brokerRepository.findAll().size();

        // Get the broker
        restBrokerMockMvc.perform(delete("/api/brokers/{id}", broker.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Broker> brokerList = brokerRepository.findAll();
        assertThat(brokerList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Broker.class);
        Broker broker1 = new Broker();
        broker1.setId(1L);
        Broker broker2 = new Broker();
        broker2.setId(broker1.getId());
        assertThat(broker1).isEqualTo(broker2);
        broker2.setId(2L);
        assertThat(broker1).isNotEqualTo(broker2);
        broker1.setId(null);
        assertThat(broker1).isNotEqualTo(broker2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(BrokerDTO.class);
        BrokerDTO brokerDTO1 = new BrokerDTO();
        brokerDTO1.setId(1L);
        BrokerDTO brokerDTO2 = new BrokerDTO();
        assertThat(brokerDTO1).isNotEqualTo(brokerDTO2);
        brokerDTO2.setId(brokerDTO1.getId());
        assertThat(brokerDTO1).isEqualTo(brokerDTO2);
        brokerDTO2.setId(2L);
        assertThat(brokerDTO1).isNotEqualTo(brokerDTO2);
        brokerDTO1.setId(null);
        assertThat(brokerDTO1).isNotEqualTo(brokerDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(brokerMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(brokerMapper.fromId(null)).isNull();
    }
}
