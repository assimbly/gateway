package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.ErrorStep;
import org.assimbly.gateway.repository.ErrorStepRepository;
import org.assimbly.gateway.service.ErrorStepService;
import org.assimbly.gateway.service.dto.ErrorStepDTO;
import org.assimbly.gateway.service.mapper.ErrorStepMapper;
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

import org.assimbly.gateway.domain.enumeration.ComponentTypeOLD;
/**
 * Test class for the ErrorStepResource REST controller.
 *
 * @see ErrorStepResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class ErrorStepResourceIntTest {

    private static final ComponentTypeOLD DEFAULT_TYPE = ComponentTypeOLD.ACTIVEMQ;
    private static final ComponentTypeOLD UPDATED_TYPE = ComponentTypeOLD.FILE;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    @Autowired
    private ErrorStepRepository errorStepRepository;

    @Autowired
    private ErrorStepMapper errorStepMapper;

    @Autowired
    private ErrorStepService errorStepService;

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

    private MockMvc restErrorStepMockMvc;

    private ErrorStep errorStep;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ErrorStepResource errorStepResource = new ErrorStepResource(errorStepService);
        this.restErrorStepMockMvc = MockMvcBuilders.standaloneSetup(errorStepResource)
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
    public static ErrorStep createEntity(EntityManager em) {
        ErrorStep errorStep = new ErrorStep()
            .type(DEFAULT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS);
        return errorStep;
    }

    @Before
    public void initTest() {
        errorStep = createEntity(em);
    }

    @Test
    @Transactional
    public void createErrorStep() throws Exception {
        int databaseSizeBeforeCreate = errorStepRepository.findAll().size();

        // Create the ErrorStep
        ErrorStepDTO errorStepDTO = errorStepMapper.toDto(errorStep);
        restErrorStepMockMvc.perform(post("/api/error-steps")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(errorStepDTO)))
            .andExpect(status().isCreated());

        // Validate the ErrorStep in the database
        List<ErrorStep> errorStepList = errorStepRepository.findAll();
        assertThat(errorStepList).hasSize(databaseSizeBeforeCreate + 1);
        ErrorStep testErrorStep = errorStepList.get(errorStepList.size() - 1);
        assertThat(testErrorStep.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testErrorStep.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testErrorStep.getOptions()).isEqualTo(DEFAULT_OPTIONS);
    }

    @Test
    @Transactional
    public void createErrorStepWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = errorStepRepository.findAll().size();

        // Create the ErrorStep with an existing ID
        errorStep.setId(1L);
        ErrorStepDTO errorStepDTO = errorStepMapper.toDto(errorStep);

        // An entity with an existing ID cannot be created, so this API call must fail
        restErrorStepMockMvc.perform(post("/api/error-steps")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(errorStepDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ErrorStep in the database
        List<ErrorStep> errorStepList = errorStepRepository.findAll();
        assertThat(errorStepList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllErrorSteps() throws Exception {
        // Initialize the database
        errorStepRepository.saveAndFlush(errorStep);

        // Get all the errorStepList
        restErrorStepMockMvc.perform(get("/api/error-steps?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(errorStep.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI)))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS)));
    }

    @Test
    @Transactional
    public void getErrorStep() throws Exception {
        // Initialize the database
        errorStepRepository.saveAndFlush(errorStep);

        // Get the errorStep
        restErrorStepMockMvc.perform(get("/api/error-steps/{id}", errorStep.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(errorStep.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS));
    }

    @Test
    @Transactional
    public void getNonExistingErrorStep() throws Exception {
        // Get the errorStep
        restErrorStepMockMvc.perform(get("/api/error-steps/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateErrorStep() throws Exception {
        // Initialize the database
        errorStepRepository.saveAndFlush(errorStep);

        int databaseSizeBeforeUpdate = errorStepRepository.findAll().size();

        // Update the errorStep
        ErrorStep updatedErrorStep = errorStepRepository.findById(errorStep.getId()).get();
        // Disconnect from session so that the updates on updatedErrorStep are not directly saved in db
        em.detach(updatedErrorStep);
        updatedErrorStep
            .type(UPDATED_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS);
        ErrorStepDTO errorStepDTO = errorStepMapper.toDto(updatedErrorStep);

        restErrorStepMockMvc.perform(put("/api/error-steps")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(errorStepDTO)))
            .andExpect(status().isOk());

        // Validate the ErrorStep in the database
        List<ErrorStep> errorStepList = errorStepRepository.findAll();
        assertThat(errorStepList).hasSize(databaseSizeBeforeUpdate);
        ErrorStep testErrorStep = errorStepList.get(errorStepList.size() - 1);
        assertThat(testErrorStep.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testErrorStep.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testErrorStep.getOptions()).isEqualTo(UPDATED_OPTIONS);
    }

    @Test
    @Transactional
    public void updateNonExistingErrorStep() throws Exception {
        int databaseSizeBeforeUpdate = errorStepRepository.findAll().size();

        // Create the ErrorStep
        ErrorStepDTO errorStepDTO = errorStepMapper.toDto(errorStep);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restErrorStepMockMvc.perform(put("/api/error-steps")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(errorStepDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ErrorStep in the database
        List<ErrorStep> errorStepList = errorStepRepository.findAll();
        assertThat(errorStepList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteErrorStep() throws Exception {
        // Initialize the database
        errorStepRepository.saveAndFlush(errorStep);

        int databaseSizeBeforeDelete = errorStepRepository.findAll().size();

        // Get the errorStep
        restErrorStepMockMvc.perform(delete("/api/error-steps/{id}", errorStep.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ErrorStep> errorStepList = errorStepRepository.findAll();
        assertThat(errorStepList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ErrorStep.class);
        ErrorStep errorStep1 = new ErrorStep();
        errorStep1.setId(1L);
        ErrorStep errorStep2 = new ErrorStep();
        errorStep2.setId(errorStep1.getId());
        assertThat(errorStep1).isEqualTo(errorStep2);
        errorStep2.setId(2L);
        assertThat(errorStep1).isNotEqualTo(errorStep2);
        errorStep1.setId(null);
        assertThat(errorStep1).isNotEqualTo(errorStep2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ErrorStepDTO.class);
        ErrorStepDTO errorStepDTO1 = new ErrorStepDTO();
        errorStepDTO1.setId(1L);
        ErrorStepDTO errorStepDTO2 = new ErrorStepDTO();
        assertThat(errorStepDTO1).isNotEqualTo(errorStepDTO2);
        errorStepDTO2.setId(errorStepDTO1.getId());
        assertThat(errorStepDTO1).isEqualTo(errorStepDTO2);
        errorStepDTO2.setId(2L);
        assertThat(errorStepDTO1).isNotEqualTo(errorStepDTO2);
        errorStepDTO1.setId(null);
        assertThat(errorStepDTO1).isNotEqualTo(errorStepDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(errorStepMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(errorStepMapper.fromId(null)).isNull();
    }
}
