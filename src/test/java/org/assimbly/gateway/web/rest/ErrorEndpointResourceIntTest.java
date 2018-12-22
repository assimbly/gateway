package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.repository.ErrorEndpointRepository;
import org.assimbly.gateway.service.dto.ErrorEndpointDTO;
import org.assimbly.gateway.service.mapper.ErrorEndpointMapper;
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

import javax.persistence.EntityManager;
import java.util.List;

import static org.assimbly.gateway.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.assimbly.gateway.domain.enumeration.EndpointType;
/**
 * Test class for the ErrorEndpointResource REST controller.
 *
 * @see ErrorEndpointResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class ErrorEndpointResourceIntTest {

    private static final EndpointType DEFAULT_TYPE = EndpointType.SONICMQ;
    private static final EndpointType UPDATED_TYPE = EndpointType.ACTIVEMQ;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    @Autowired
    private ErrorEndpointRepository errorEndpointRepository;

    @Autowired
    private ErrorEndpointMapper errorEndpointMapper;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restErrorEndpointMockMvc;

    private ErrorEndpoint errorEndpoint;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ErrorEndpointResource errorEndpointResource = new ErrorEndpointResource(errorEndpointRepository, errorEndpointMapper);
        this.restErrorEndpointMockMvc = MockMvcBuilders.standaloneSetup(errorEndpointResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ErrorEndpoint createEntity(EntityManager em) {
        ErrorEndpoint errorEndpoint = new ErrorEndpoint()
            .type(DEFAULT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS);
        return errorEndpoint;
    }

    @Before
    public void initTest() {
        errorEndpoint = createEntity(em);
    }

    @Test
    @Transactional
    public void createErrorEndpoint() throws Exception {
        int databaseSizeBeforeCreate = errorEndpointRepository.findAll().size();

        // Create the ErrorEndpoint
        ErrorEndpointDTO errorEndpointDTO = errorEndpointMapper.toDto(errorEndpoint);
        restErrorEndpointMockMvc.perform(post("/api/error-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(errorEndpointDTO)))
            .andExpect(status().isCreated());

        // Validate the ErrorEndpoint in the database
        List<ErrorEndpoint> errorEndpointList = errorEndpointRepository.findAll();
        assertThat(errorEndpointList).hasSize(databaseSizeBeforeCreate + 1);
        ErrorEndpoint testErrorEndpoint = errorEndpointList.get(errorEndpointList.size() - 1);
        assertThat(testErrorEndpoint.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testErrorEndpoint.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testErrorEndpoint.getOptions()).isEqualTo(DEFAULT_OPTIONS);
    }

    @Test
    @Transactional
    public void createErrorEndpointWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = errorEndpointRepository.findAll().size();

        // Create the ErrorEndpoint with an existing ID
        errorEndpoint.setId(1L);
        ErrorEndpointDTO errorEndpointDTO = errorEndpointMapper.toDto(errorEndpoint);

        // An entity with an existing ID cannot be created, so this API call must fail
        restErrorEndpointMockMvc.perform(post("/api/error-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(errorEndpointDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ErrorEndpoint in the database
        List<ErrorEndpoint> errorEndpointList = errorEndpointRepository.findAll();
        assertThat(errorEndpointList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllErrorEndpoints() throws Exception {
        // Initialize the database
        errorEndpointRepository.saveAndFlush(errorEndpoint);

        // Get all the errorEndpointList
        restErrorEndpointMockMvc.perform(get("/api/error-endpoints?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(errorEndpoint.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI.toString())))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS.toString())));
    }

    @Test
    @Transactional
    public void getErrorEndpoint() throws Exception {
        // Initialize the database
        errorEndpointRepository.saveAndFlush(errorEndpoint);

        // Get the errorEndpoint
        restErrorEndpointMockMvc.perform(get("/api/error-endpoints/{id}", errorEndpoint.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(errorEndpoint.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI.toString()))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingErrorEndpoint() throws Exception {
        // Get the errorEndpoint
        restErrorEndpointMockMvc.perform(get("/api/error-endpoints/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateErrorEndpoint() throws Exception {
        // Initialize the database
        errorEndpointRepository.saveAndFlush(errorEndpoint);
        int databaseSizeBeforeUpdate = errorEndpointRepository.findAll().size();

        // Update the errorEndpoint
        ErrorEndpoint updatedErrorEndpoint = errorEndpointRepository.findOne(errorEndpoint.getId());
        // Disconnect from session so that the updates on updatedErrorEndpoint are not directly saved in db
        em.detach(updatedErrorEndpoint);
        updatedErrorEndpoint
            .type(UPDATED_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS);
        ErrorEndpointDTO errorEndpointDTO = errorEndpointMapper.toDto(updatedErrorEndpoint);

        restErrorEndpointMockMvc.perform(put("/api/error-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(errorEndpointDTO)))
            .andExpect(status().isOk());

        // Validate the ErrorEndpoint in the database
        List<ErrorEndpoint> errorEndpointList = errorEndpointRepository.findAll();
        assertThat(errorEndpointList).hasSize(databaseSizeBeforeUpdate);
        ErrorEndpoint testErrorEndpoint = errorEndpointList.get(errorEndpointList.size() - 1);
        assertThat(testErrorEndpoint.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testErrorEndpoint.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testErrorEndpoint.getOptions()).isEqualTo(UPDATED_OPTIONS);
    }

    @Test
    @Transactional
    public void updateNonExistingErrorEndpoint() throws Exception {
        int databaseSizeBeforeUpdate = errorEndpointRepository.findAll().size();

        // Create the ErrorEndpoint
        ErrorEndpointDTO errorEndpointDTO = errorEndpointMapper.toDto(errorEndpoint);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restErrorEndpointMockMvc.perform(put("/api/error-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(errorEndpointDTO)))
            .andExpect(status().isCreated());

        // Validate the ErrorEndpoint in the database
        List<ErrorEndpoint> errorEndpointList = errorEndpointRepository.findAll();
        assertThat(errorEndpointList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteErrorEndpoint() throws Exception {
        // Initialize the database
        errorEndpointRepository.saveAndFlush(errorEndpoint);
        int databaseSizeBeforeDelete = errorEndpointRepository.findAll().size();

        // Get the errorEndpoint
        restErrorEndpointMockMvc.perform(delete("/api/error-endpoints/{id}", errorEndpoint.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ErrorEndpoint> errorEndpointList = errorEndpointRepository.findAll();
        assertThat(errorEndpointList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ErrorEndpoint.class);
        ErrorEndpoint errorEndpoint1 = new ErrorEndpoint();
        errorEndpoint1.setId(1L);
        ErrorEndpoint errorEndpoint2 = new ErrorEndpoint();
        errorEndpoint2.setId(errorEndpoint1.getId());
        assertThat(errorEndpoint1).isEqualTo(errorEndpoint2);
        errorEndpoint2.setId(2L);
        assertThat(errorEndpoint1).isNotEqualTo(errorEndpoint2);
        errorEndpoint1.setId(null);
        assertThat(errorEndpoint1).isNotEqualTo(errorEndpoint2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ErrorEndpointDTO.class);
        ErrorEndpointDTO errorEndpointDTO1 = new ErrorEndpointDTO();
        errorEndpointDTO1.setId(1L);
        ErrorEndpointDTO errorEndpointDTO2 = new ErrorEndpointDTO();
        assertThat(errorEndpointDTO1).isNotEqualTo(errorEndpointDTO2);
        errorEndpointDTO2.setId(errorEndpointDTO1.getId());
        assertThat(errorEndpointDTO1).isEqualTo(errorEndpointDTO2);
        errorEndpointDTO2.setId(2L);
        assertThat(errorEndpointDTO1).isNotEqualTo(errorEndpointDTO2);
        errorEndpointDTO1.setId(null);
        assertThat(errorEndpointDTO1).isNotEqualTo(errorEndpointDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(errorEndpointMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(errorEndpointMapper.fromId(null)).isNull();
    }
}
