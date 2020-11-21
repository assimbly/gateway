package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.Endpoint;
import org.assimbly.gateway.repository.EndpointRepository;
import org.assimbly.gateway.service.EndpointService;
import org.assimbly.gateway.service.dto.EndpointDTO;
import org.assimbly.gateway.service.mapper.EndpointMapper;
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
 * Test class for the EndpointResource REST controller.
 *
 * @see EndpointResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class EndpointResourceIntTest {

    private static final EndpointType DEFAULT_TYPE = EndpointType.ACTIVEMQ;
    private static final EndpointType UPDATED_TYPE = EndpointType.FILE;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    @Autowired
    private EndpointRepository endpointRepository;

    @Autowired
    private EndpointMapper endpointMapper;

    @Autowired
    private EndpointService endpointService;

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

    private MockMvc restEndpointMockMvc;

    private Endpoint endpoint;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final EndpointResource endpointResource = new EndpointResource(endpointService, endpointRepository, endpointMapper);
        this.restEndpointMockMvc = MockMvcBuilders.standaloneSetup(endpointResource)
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
    public static Endpoint createEntity(EntityManager em) {
        Endpoint endpoint = new Endpoint()
            .type(DEFAULT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS);
        return endpoint;
    }

    @Before
    public void initTest() {
        endpoint = createEntity(em);
    }

    @Test
    @Transactional
    public void createEndpoint() throws Exception {
        int databaseSizeBeforeCreate = endpointRepository.findAll().size();

        // Create the Endpoint
        EndpointDTO endpointDTO = endpointMapper.toDto(endpoint);
        restEndpointMockMvc.perform(post("/api/endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(endpointDTO)))
            .andExpect(status().isCreated());

        // Validate the endpoint in the database
        List<Endpoint> endpointList = endpointRepository.findAll();
        assertThat(endpointList).hasSize(databaseSizeBeforeCreate + 1);
        Endpoint testEndpoint = endpointList.get(endpointList.size() - 1);
        assertThat(testEndpoint.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testEndpoint.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testEndpoint.getOptions()).isEqualTo(DEFAULT_OPTIONS);
    }

    @Test
    @Transactional
    public void createEndpointWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = endpointRepository.findAll().size();

        // Create the Endpoint with an existing ID
        endpoint.setId(1L);
        EndpointDTO endpointDTO = endpointMapper.toDto(endpoint);

        // An entity with an existing ID cannot be created, so this API call must fail
        restEndpointMockMvc.perform(post("/api/endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(endpointDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Endpoint in the database
        List<Endpoint> endpointList = endpointRepository.findAll();
        assertThat(endpointList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllEndpoints() throws Exception {
        // Initialize the database
        endpointRepository.saveAndFlush(endpoint);

        // Get all the endpointList
        restEndpointMockMvc.perform(get("/api/endpoints?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(endpoint.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI.toString())))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS.toString())));
    }
    
    @Test
    @Transactional
    public void getEndpoint() throws Exception {
        // Initialize the database
        endpointRepository.saveAndFlush(endpoint);

        // Get the endpoint
        restEndpointMockMvc.perform(get("/api/endpoints/{id}", endpoint.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(endpoint.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI.toString()))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingEndpoint() throws Exception {
        // Get the endpoint
        restEndpointMockMvc.perform(get("/api/endpoints/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateEndpoint() throws Exception {
        // Initialize the database
        endpointRepository.saveAndFlush(endpoint);

        int databaseSizeBeforeUpdate = endpointRepository.findAll().size();

        // Update the endpoint
        Endpoint updatedEndpoint = endpointRepository.findById(endpoint.getId()).get();
        // Disconnect from session so that the updates on updatedEndpoint are not directly saved in db
        em.detach(updatedEndpoint);
        updatedEndpoint
            .type(UPDATED_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS);
        EndpointDTO endpointDTO = endpointMapper.toDto(updatedEndpoint);

        restEndpointMockMvc.perform(put("/api/endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(endpointDTO)))
            .andExpect(status().isOk());

        // Validate the Endpoint in the database
        List<Endpoint> endpointList = endpointRepository.findAll();
        assertThat(endpointList).hasSize(databaseSizeBeforeUpdate);
        Endpoint testEndpoint = endpointList.get(endpointList.size() - 1);
        assertThat(testEndpoint.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testEndpoint.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testEndpoint.getOptions()).isEqualTo(UPDATED_OPTIONS);
    }

    @Test
    @Transactional
    public void updateNonExistingEndpoint() throws Exception {
        int databaseSizeBeforeUpdate = endpointRepository.findAll().size();

        // Create the Endpoint
        EndpointDTO endpointDTO = endpointMapper.toDto(endpoint);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEndpointMockMvc.perform(put("/api/endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(endpointDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Endpoint in the database
        List<Endpoint> endpointList = endpointRepository.findAll();
        assertThat(endpointList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteEndpoint() throws Exception {
        // Initialize the database
        endpointRepository.saveAndFlush(endpoint);

        int databaseSizeBeforeDelete = endpointRepository.findAll().size();

        // Get the endpoint
        restEndpointMockMvc.perform(delete("/api/endpoints/{id}", endpoint.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Endpoint> endpointList = endpointRepository.findAll();
        assertThat(endpointList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Endpoint.class);
        Endpoint endpoint1 = new Endpoint();
        endpoint1.setId(1L);
        Endpoint endpoint2 = new Endpoint();
        endpoint2.setId(endpoint1.getId());
        assertThat(endpoint1).isEqualTo(endpoint2);
        endpoint2.setId(2L);
        assertThat(endpoint1).isNotEqualTo(endpoint2);
        endpoint1.setId(null);
        assertThat(endpoint1).isNotEqualTo(endpoint2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(EndpointDTO.class);
        EndpointDTO endpointDTO1 = new EndpointDTO();
        endpointDTO1.setId(1L);
        EndpointDTO endpointDTO2 = new EndpointDTO();
        assertThat(endpointDTO1).isNotEqualTo(endpointDTO2);
        endpointDTO2.setId(endpointDTO1.getId());
        assertThat(endpointDTO1).isEqualTo(endpointDTO2);
        endpointDTO2.setId(2L);
        assertThat(endpointDTO1).isNotEqualTo(endpointDTO2);
        endpointDTO1.setId(null);
        assertThat(endpointDTO1).isNotEqualTo(endpointDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(endpointMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(endpointMapper.fromId(null)).isNull();
    }
}
