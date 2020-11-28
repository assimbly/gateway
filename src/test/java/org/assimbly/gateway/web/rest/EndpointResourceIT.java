package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.Endpoint;
import org.assimbly.gateway.repository.EndpointRepository;
import org.assimbly.gateway.service.EndpointService;
import org.assimbly.gateway.service.dto.EndpointDTO;
import org.assimbly.gateway.service.mapper.EndpointMapper;
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

import org.assimbly.gateway.domain.enumeration.ComponentType;
import org.assimbly.gateway.domain.enumeration.EndpointType;
/**
 * Integration tests for the {@link EndpointResource} REST controller.
 */
@SpringBootTest(classes = GatewayApp.class)
public class EndpointResourceIT {

    private static final ComponentType DEFAULT_COMPONENT_TYPE = ComponentType.ACTIVEMQ;
    private static final ComponentType UPDATED_COMPONENT_TYPE = ComponentType.FILE;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    private static final EndpointType DEFAULT_ENDPOINT_TYPE = EndpointType.FROM;
    private static final EndpointType UPDATED_ENDPOINT_TYPE = EndpointType.FROM;

    private static final Integer DEFAULT_RESPONSE_ID = 1;
    private static final Integer UPDATED_RESPONSE_ID = 2;

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

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final EndpointResource endpointResource = new EndpointResource(endpointService);
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
            .componentType(DEFAULT_COMPONENT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS)
            .endpointType(DEFAULT_ENDPOINT_TYPE)
            .responseId(DEFAULT_RESPONSE_ID);
        return endpoint;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Endpoint createUpdatedEntity(EntityManager em) {
        Endpoint endpoint = new Endpoint()
            .componentType(UPDATED_COMPONENT_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS)
            .endpointType(UPDATED_ENDPOINT_TYPE)
            .responseId(UPDATED_RESPONSE_ID);
        return endpoint;
    }

    @BeforeEach
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
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(endpointDTO)))
            .andExpect(status().isCreated());

        // Validate the Endpoint in the database
        List<Endpoint> endpointList = endpointRepository.findAll();
        assertThat(endpointList).hasSize(databaseSizeBeforeCreate + 1);
        Endpoint testEndpoint = endpointList.get(endpointList.size() - 1);
        assertThat(testEndpoint.getComponentType()).isEqualTo(DEFAULT_COMPONENT_TYPE);
        assertThat(testEndpoint.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testEndpoint.getOptions()).isEqualTo(DEFAULT_OPTIONS);
        assertThat(testEndpoint.getEndpointType()).isEqualTo(DEFAULT_ENDPOINT_TYPE);
        assertThat(testEndpoint.getResponseId()).isEqualTo(DEFAULT_RESPONSE_ID);
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
            .contentType(TestUtil.APPLICATION_JSON)
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
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(endpoint.getId().intValue())))
            .andExpect(jsonPath("$.[*].componentType").value(hasItem(DEFAULT_COMPONENT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI)))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS)))
            .andExpect(jsonPath("$.[*].endpointType").value(hasItem(DEFAULT_ENDPOINT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].responseId").value(hasItem(DEFAULT_RESPONSE_ID)));
    }
    
    @Test
    @Transactional
    public void getEndpoint() throws Exception {
        // Initialize the database
        endpointRepository.saveAndFlush(endpoint);

        // Get the endpoint
        restEndpointMockMvc.perform(get("/api/endpoints/{id}", endpoint.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(endpoint.getId().intValue()))
            .andExpect(jsonPath("$.componentType").value(DEFAULT_COMPONENT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS))
            .andExpect(jsonPath("$.endpointType").value(DEFAULT_ENDPOINT_TYPE.toString()))
            .andExpect(jsonPath("$.responseId").value(DEFAULT_RESPONSE_ID));
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
            .componentType(UPDATED_COMPONENT_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS)
            .endpointType(UPDATED_ENDPOINT_TYPE)
            .responseId(UPDATED_RESPONSE_ID);
        EndpointDTO endpointDTO = endpointMapper.toDto(updatedEndpoint);

        restEndpointMockMvc.perform(put("/api/endpoints")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(endpointDTO)))
            .andExpect(status().isOk());

        // Validate the Endpoint in the database
        List<Endpoint> endpointList = endpointRepository.findAll();
        assertThat(endpointList).hasSize(databaseSizeBeforeUpdate);
        Endpoint testEndpoint = endpointList.get(endpointList.size() - 1);
        assertThat(testEndpoint.getComponentType()).isEqualTo(UPDATED_COMPONENT_TYPE);
        assertThat(testEndpoint.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testEndpoint.getOptions()).isEqualTo(UPDATED_OPTIONS);
        assertThat(testEndpoint.getEndpointType()).isEqualTo(UPDATED_ENDPOINT_TYPE);
        assertThat(testEndpoint.getResponseId()).isEqualTo(UPDATED_RESPONSE_ID);
    }

    @Test
    @Transactional
    public void updateNonExistingEndpoint() throws Exception {
        int databaseSizeBeforeUpdate = endpointRepository.findAll().size();

        // Create the Endpoint
        EndpointDTO endpointDTO = endpointMapper.toDto(endpoint);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEndpointMockMvc.perform(put("/api/endpoints")
            .contentType(TestUtil.APPLICATION_JSON)
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

        // Delete the endpoint
        restEndpointMockMvc.perform(delete("/api/endpoints/{id}", endpoint.getId())
            .accept(TestUtil.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Endpoint> endpointList = endpointRepository.findAll();
        assertThat(endpointList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
