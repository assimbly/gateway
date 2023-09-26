package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.gateway.service.StepService;
import org.assimbly.gateway.service.dto.StepDTO;
import org.assimbly.gateway.service.mapper.StepMapper;
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

import org.assimbly.gateway.domain.enumeration.ComponentTypeOLD;
import org.assimbly.gateway.domain.enumeration.StepType;
/**
 * Integration tests for the {@link StepResource} REST controller.
 */
@SpringBootTest(classes = GatewayApp.class)
public class StepResourceIT {

    private static final ComponentTypeOLD DEFAULT_COMPONENT_TYPE = ComponentTypeOLD.ACTIVEMQ;
    private static final ComponentTypeOLD UPDATED_COMPONENT_TYPE = ComponentTypeOLD.FILE;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    private static final StepType DEFAULT_STEP_TYPE = StepType.FROM;
    private static final StepType UPDATED_STEP_TYPE = StepType.FROM;

    private static final Integer DEFAULT_RESPONSE_ID = 1;
    private static final Integer UPDATED_RESPONSE_ID = 2;

    @Autowired
    private StepRepository stepRepository;

    @Autowired
    private StepMapper stepMapper;

    @Autowired
    private StepService stepService;

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

    private MockMvc restStepMockMvc;

    private Step step;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final StepResource stepResource = new StepResource(stepService);
        this.restStepMockMvc = MockMvcBuilders.standaloneSetup(stepResource)
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
    public static Step createEntity(EntityManager em) {
        Step step = new Step()
            .componentType(DEFAULT_COMPONENT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS)
            .stepType(DEFAULT_STEP_TYPE)
            .responseId(DEFAULT_RESPONSE_ID);
        return step;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Step createUpdatedEntity(EntityManager em) {
        Step step = new Step()
            .componentType(UPDATED_COMPONENT_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS)
            .stepType(UPDATED_STEP_TYPE)
            .responseId(UPDATED_RESPONSE_ID);
        return step;
    }

    @BeforeEach
    public void initTest() {
        step = createEntity(em);
    }

    @Test
    @Transactional
    public void createStep() throws Exception {
        int databaseSizeBeforeCreate = stepRepository.findAll().size();

        // Create the Step
        StepDTO stepDTO = stepMapper.toDto(step);
        restStepMockMvc.perform(post("/api/steps")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(stepDTO)))
            .andExpect(status().isCreated());

        // Validate the Step in the database
        List<Step> stepList = stepRepository.findAll();
        assertThat(stepList).hasSize(databaseSizeBeforeCreate + 1);
        Step testStep = stepList.get(stepList.size() - 1);
        assertThat(testStep.getComponentType()).isEqualTo(DEFAULT_COMPONENT_TYPE);
        assertThat(testStep.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testStep.getOptions()).isEqualTo(DEFAULT_OPTIONS);
        assertThat(testStep.getStepType()).isEqualTo(DEFAULT_STEP_TYPE);
        assertThat(testStep.getResponseId()).isEqualTo(DEFAULT_RESPONSE_ID);
    }

    @Test
    @Transactional
    public void createStepWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = stepRepository.findAll().size();

        // Create the Step with an existing ID
        step.setId(1L);
        StepDTO stepDTO = stepMapper.toDto(step);

        // An entity with an existing ID cannot be created, so this API call must fail
        restStepMockMvc.perform(post("/api/steps")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(stepDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Step in the database
        List<Step> stepList = stepRepository.findAll();
        assertThat(stepList).hasSize(databaseSizeBeforeCreate);
    }


    @Test
    @Transactional
    public void getAllSteps() throws Exception {
        // Initialize the database
        stepRepository.saveAndFlush(step);

        // Get all the stepList
        restStepMockMvc.perform(get("/api/steps?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(step.getId().intValue())))
            .andExpect(jsonPath("$.[*].componentType").value(hasItem(DEFAULT_COMPONENT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI)))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS)))
            .andExpect(jsonPath("$.[*].stepType").value(hasItem(DEFAULT_STEP_TYPE.toString())))
            .andExpect(jsonPath("$.[*].responseId").value(hasItem(DEFAULT_RESPONSE_ID)));
    }

    @Test
    @Transactional
    public void getStep() throws Exception {
        // Initialize the database
        stepRepository.saveAndFlush(step);

        // Get the step
        restStepMockMvc.perform(get("/api/steps/{id}", step.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(step.getId().intValue()))
            .andExpect(jsonPath("$.componentType").value(DEFAULT_COMPONENT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS))
            .andExpect(jsonPath("$.stepType").value(DEFAULT_STEP_TYPE.toString()))
            .andExpect(jsonPath("$.responseId").value(DEFAULT_RESPONSE_ID));
    }

    @Test
    @Transactional
    public void getNonExistingStep() throws Exception {
        // Get the step
        restStepMockMvc.perform(get("/api/steps/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateStep() throws Exception {
        // Initialize the database
        stepRepository.saveAndFlush(step);

        int databaseSizeBeforeUpdate = stepRepository.findAll().size();

        // Update the step
        Step updatedStep = stepRepository.findById(step.getId()).get();
        // Disconnect from session so that the updates on updatedStep are not directly saved in db
        em.detach(updatedStep);
        updatedStep
            .componentType(UPDATED_COMPONENT_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS)
            .stepType(UPDATED_STEP_TYPE)
            .responseId(UPDATED_RESPONSE_ID);
        StepDTO stepDTO = stepMapper.toDto(updatedStep);

        restStepMockMvc.perform(put("/api/steps")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(stepDTO)))
            .andExpect(status().isOk());

        // Validate the Step in the database
        List<Step> stepList = stepRepository.findAll();
        assertThat(stepList).hasSize(databaseSizeBeforeUpdate);
        Step testStep = stepList.get(stepList.size() - 1);
        assertThat(testStep.getComponentType()).isEqualTo(UPDATED_COMPONENT_TYPE);
        assertThat(testStep.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testStep.getOptions()).isEqualTo(UPDATED_OPTIONS);
        assertThat(testStep.getStepType()).isEqualTo(UPDATED_STEP_TYPE);
        assertThat(testStep.getResponseId()).isEqualTo(UPDATED_RESPONSE_ID);
    }

    @Test
    @Transactional
    public void updateNonExistingStep() throws Exception {
        int databaseSizeBeforeUpdate = stepRepository.findAll().size();

        // Create the Step
        StepDTO stepDTO = stepMapper.toDto(step);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStepMockMvc.perform(put("/api/steps")
            .contentType(TestUtil.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(stepDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Step in the database
        List<Step> stepList = stepRepository.findAll();
        assertThat(stepList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteStep() throws Exception {
        // Initialize the database
        stepRepository.saveAndFlush(step);

        int databaseSizeBeforeDelete = stepRepository.findAll().size();

        // Delete the step
        restStepMockMvc.perform(delete("/api/steps/{id}", step.getId())
            .accept(TestUtil.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Step> stepList = stepRepository.findAll();
        assertThat(stepList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
