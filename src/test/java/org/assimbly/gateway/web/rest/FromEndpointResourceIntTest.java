package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.repository.FromEndpointRepository;
import org.assimbly.gateway.service.FromEndpointService;
import org.assimbly.gateway.service.dto.FromEndpointDTO;
import org.assimbly.gateway.service.mapper.FromEndpointMapper;
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

import org.assimbly.gateway.domain.enumeration.EndpointType;
/**
 * Test class for the FromEndpointResource REST controller.
 *
 * @see FromEndpointResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class FromEndpointResourceIntTest {

    private static final EndpointType DEFAULT_TYPE = EndpointType.ACTIVEMQ;
    private static final EndpointType UPDATED_TYPE = EndpointType.FILE;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    @Autowired
    private FromEndpointRepository fromEndpointRepository;

    @Autowired
    private FromEndpointMapper fromEndpointMapper;

    @Autowired
    private FromEndpointService fromEndpointService;

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

    private MockMvc restFromEndpointMockMvc;

    private FromEndpoint fromEndpoint;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final FromEndpointResource fromEndpointResource = new FromEndpointResource(fromEndpointService);
        this.restFromEndpointMockMvc = MockMvcBuilders.standaloneSetup(fromEndpointResource)
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
    public static FromEndpoint createEntity(EntityManager em) {
        FromEndpoint fromEndpoint = new FromEndpoint()
            .type(DEFAULT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS);
        return fromEndpoint;
    }

    @Before
    public void initTest() {
        fromEndpoint = createEntity(em);
    }

    @Test
    @Transactional
    public void createFromEndpoint() throws Exception {
        int databaseSizeBeforeCreate = fromEndpointRepository.findAll().size();

        // Create the FromEndpoint
        FromEndpointDTO fromEndpointDTO = fromEndpointMapper.toDto(fromEndpoint);
        restFromEndpointMockMvc.perform(post("/api/from-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fromEndpointDTO)))
            .andExpect(status().isCreated());

        // Validate the FromEndpoint in the database
        List<FromEndpoint> fromEndpointList = fromEndpointRepository.findAll();
        assertThat(fromEndpointList).hasSize(databaseSizeBeforeCreate + 1);
        FromEndpoint testFromEndpoint = fromEndpointList.get(fromEndpointList.size() - 1);
        assertThat(testFromEndpoint.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testFromEndpoint.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testFromEndpoint.getOptions()).isEqualTo(DEFAULT_OPTIONS);
    }

    @Test
    @Transactional
    public void createFromEndpointWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = fromEndpointRepository.findAll().size();

        // Create the FromEndpoint with an existing ID
        fromEndpoint.setId(1L);
        FromEndpointDTO fromEndpointDTO = fromEndpointMapper.toDto(fromEndpoint);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFromEndpointMockMvc.perform(post("/api/from-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fromEndpointDTO)))
            .andExpect(status().isBadRequest());

        // Validate the FromEndpoint in the database
        List<FromEndpoint> fromEndpointList = fromEndpointRepository.findAll();
        assertThat(fromEndpointList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllFromEndpoints() throws Exception {
        // Initialize the database
        fromEndpointRepository.saveAndFlush(fromEndpoint);

        // Get all the fromEndpointList
        restFromEndpointMockMvc.perform(get("/api/from-endpoints?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(fromEndpoint.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI.toString())))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS.toString())));
    }
    
    @Test
    @Transactional
    public void getFromEndpoint() throws Exception {
        // Initialize the database
        fromEndpointRepository.saveAndFlush(fromEndpoint);

        // Get the fromEndpoint
        restFromEndpointMockMvc.perform(get("/api/from-endpoints/{id}", fromEndpoint.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(fromEndpoint.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI.toString()))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingFromEndpoint() throws Exception {
        // Get the fromEndpoint
        restFromEndpointMockMvc.perform(get("/api/from-endpoints/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFromEndpoint() throws Exception {
        // Initialize the database
        fromEndpointRepository.saveAndFlush(fromEndpoint);

        int databaseSizeBeforeUpdate = fromEndpointRepository.findAll().size();

        // Update the fromEndpoint
        FromEndpoint updatedFromEndpoint = fromEndpointRepository.findById(fromEndpoint.getId()).get();
        // Disconnect from session so that the updates on updatedFromEndpoint are not directly saved in db
        em.detach(updatedFromEndpoint);
        updatedFromEndpoint
            .type(UPDATED_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS);
        FromEndpointDTO fromEndpointDTO = fromEndpointMapper.toDto(updatedFromEndpoint);

        restFromEndpointMockMvc.perform(put("/api/from-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fromEndpointDTO)))
            .andExpect(status().isOk());

        // Validate the FromEndpoint in the database
        List<FromEndpoint> fromEndpointList = fromEndpointRepository.findAll();
        assertThat(fromEndpointList).hasSize(databaseSizeBeforeUpdate);
        FromEndpoint testFromEndpoint = fromEndpointList.get(fromEndpointList.size() - 1);
        assertThat(testFromEndpoint.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testFromEndpoint.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testFromEndpoint.getOptions()).isEqualTo(UPDATED_OPTIONS);
    }

    @Test
    @Transactional
    public void updateNonExistingFromEndpoint() throws Exception {
        int databaseSizeBeforeUpdate = fromEndpointRepository.findAll().size();

        // Create the FromEndpoint
        FromEndpointDTO fromEndpointDTO = fromEndpointMapper.toDto(fromEndpoint);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFromEndpointMockMvc.perform(put("/api/from-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fromEndpointDTO)))
            .andExpect(status().isBadRequest());

        // Validate the FromEndpoint in the database
        List<FromEndpoint> fromEndpointList = fromEndpointRepository.findAll();
        assertThat(fromEndpointList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteFromEndpoint() throws Exception {
        // Initialize the database
        fromEndpointRepository.saveAndFlush(fromEndpoint);

        int databaseSizeBeforeDelete = fromEndpointRepository.findAll().size();

        // Get the fromEndpoint
        restFromEndpointMockMvc.perform(delete("/api/from-endpoints/{id}", fromEndpoint.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<FromEndpoint> fromEndpointList = fromEndpointRepository.findAll();
        assertThat(fromEndpointList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FromEndpoint.class);
        FromEndpoint fromEndpoint1 = new FromEndpoint();
        fromEndpoint1.setId(1L);
        FromEndpoint fromEndpoint2 = new FromEndpoint();
        fromEndpoint2.setId(fromEndpoint1.getId());
        assertThat(fromEndpoint1).isEqualTo(fromEndpoint2);
        fromEndpoint2.setId(2L);
        assertThat(fromEndpoint1).isNotEqualTo(fromEndpoint2);
        fromEndpoint1.setId(null);
        assertThat(fromEndpoint1).isNotEqualTo(fromEndpoint2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(FromEndpointDTO.class);
        FromEndpointDTO fromEndpointDTO1 = new FromEndpointDTO();
        fromEndpointDTO1.setId(1L);
        FromEndpointDTO fromEndpointDTO2 = new FromEndpointDTO();
        assertThat(fromEndpointDTO1).isNotEqualTo(fromEndpointDTO2);
        fromEndpointDTO2.setId(fromEndpointDTO1.getId());
        assertThat(fromEndpointDTO1).isEqualTo(fromEndpointDTO2);
        fromEndpointDTO2.setId(2L);
        assertThat(fromEndpointDTO1).isNotEqualTo(fromEndpointDTO2);
        fromEndpointDTO1.setId(null);
        assertThat(fromEndpointDTO1).isNotEqualTo(fromEndpointDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(fromEndpointMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(fromEndpointMapper.fromId(null)).isNull();
    }
}
