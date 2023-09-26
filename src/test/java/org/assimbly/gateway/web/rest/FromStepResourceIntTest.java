package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.FromStep;
import org.assimbly.gateway.repository.FromStepRepository;
import org.assimbly.gateway.service.FromStepService;
import org.assimbly.gateway.service.dto.FromStepDTO;
import org.assimbly.gateway.service.mapper.FromStepMapper;
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
 * Test class for the FromStepResource REST controller.
 *
 * @see FromStepResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class FromStepResourceIntTest {

    private static final ComponentTypeOLD DEFAULT_TYPE = ComponentTypeOLD.ACTIVEMQ;
    private static final ComponentTypeOLD UPDATED_TYPE = ComponentTypeOLD.FILE;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    @Autowired
    private FromStepRepository fromStepRepository;

    @Autowired
    private FromStepMapper fromStepMapper;

    @Autowired
    private FromStepService fromStepService;

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

    private MockMvc restFromStepMockMvc;

    private FromStep fromStep;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final FromStepResource fromStepResource = new FromStepResource(fromStepService);
        this.restFromStepMockMvc = MockMvcBuilders.standaloneSetup(fromStepResource)
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
    public static FromStep createEntity(EntityManager em) {
        FromStep fromStep = new FromStep()
            .type(DEFAULT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS);
        return fromStep;
    }

    @Before
    public void initTest() {
        fromStep = createEntity(em);
    }

    @Test
    @Transactional
    public void createFromStep() throws Exception {
        int databaseSizeBeforeCreate = fromStepRepository.findAll().size();

        // Create the FromStep
        FromStepDTO fromStepDTO = fromStepMapper.toDto(fromStep);
        restFromStepMockMvc.perform(post("/api/from-steps")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fromStepDTO)))
            .andExpect(status().isCreated());

        // Validate the FromStep in the database
        List<FromStep> fromStepList = fromStepRepository.findAll();
        assertThat(fromStepList).hasSize(databaseSizeBeforeCreate + 1);
        FromStep testFromStep = fromStepList.get(fromStepList.size() - 1);
        assertThat(testFromStep.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testFromStep.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testFromStep.getOptions()).isEqualTo(DEFAULT_OPTIONS);
    }

    @Test
    @Transactional
    public void createFromStepWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = fromStepRepository.findAll().size();

        // Create the FromStep with an existing ID
        fromStep.setId(1L);
        FromStepDTO fromStepDTO = fromStepMapper.toDto(fromStep);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFromStepMockMvc.perform(post("/api/from-steps")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fromStepDTO)))
            .andExpect(status().isBadRequest());

        // Validate the FromStep in the database
        List<FromStep> fromStepList = fromStepRepository.findAll();
        assertThat(fromStepList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllFromSteps() throws Exception {
        // Initialize the database
        fromStepRepository.saveAndFlush(fromStep);

        // Get all the fromStepList
        restFromStepMockMvc.perform(get("/api/from-steps?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(fromStep.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI)))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS)));
    }

    @Test
    @Transactional
    public void getFromStep() throws Exception {
        // Initialize the database
        fromStepRepository.saveAndFlush(fromStep);

        // Get the fromStep
        restFromStepMockMvc.perform(get("/api/from-steps/{id}", fromStep.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(fromStep.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS));
    }

    @Test
    @Transactional
    public void getNonExistingFromStep() throws Exception {
        // Get the fromStep
        restFromStepMockMvc.perform(get("/api/from-steps/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFromStep() throws Exception {
        // Initialize the database
        fromStepRepository.saveAndFlush(fromStep);

        int databaseSizeBeforeUpdate = fromStepRepository.findAll().size();

        // Update the fromStep
        FromStep updatedFromStep = fromStepRepository.findById(fromStep.getId()).get();
        // Disconnect from session so that the updates on updatedFromStep are not directly saved in db
        em.detach(updatedFromStep);
        updatedFromStep
            .type(UPDATED_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS);
        FromStepDTO fromStepDTO = fromStepMapper.toDto(updatedFromStep);

        restFromStepMockMvc.perform(put("/api/from-steps")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fromStepDTO)))
            .andExpect(status().isOk());

        // Validate the FromStep in the database
        List<FromStep> fromStepList = fromStepRepository.findAll();
        assertThat(fromStepList).hasSize(databaseSizeBeforeUpdate);
        FromStep testFromStep = fromStepList.get(fromStepList.size() - 1);
        assertThat(testFromStep.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testFromStep.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testFromStep.getOptions()).isEqualTo(UPDATED_OPTIONS);
    }

    @Test
    @Transactional
    public void updateNonExistingFromStep() throws Exception {
        int databaseSizeBeforeUpdate = fromStepRepository.findAll().size();

        // Create the FromStep
        FromStepDTO fromStepDTO = fromStepMapper.toDto(fromStep);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFromStepMockMvc.perform(put("/api/from-steps")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(fromStepDTO)))
            .andExpect(status().isBadRequest());

        // Validate the FromStep in the database
        List<FromStep> fromStepList = fromStepRepository.findAll();
        assertThat(fromStepList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteFromStep() throws Exception {
        // Initialize the database
        fromStepRepository.saveAndFlush(fromStep);

        int databaseSizeBeforeDelete = fromStepRepository.findAll().size();

        // Get the fromStep
        restFromStepMockMvc.perform(delete("/api/from-steps/{id}", fromStep.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<FromStep> fromStepList = fromStepRepository.findAll();
        assertThat(fromStepList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FromStep.class);
        FromStep fromStep1 = new FromStep();
        fromStep1.setId(1L);
        FromStep fromStep2 = new FromStep();
        fromStep2.setId(fromStep1.getId());
        assertThat(fromStep1).isEqualTo(fromStep2);
        fromStep2.setId(2L);
        assertThat(fromStep1).isNotEqualTo(fromStep2);
        fromStep1.setId(null);
        assertThat(fromStep1).isNotEqualTo(fromStep2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(FromStepDTO.class);
        FromStepDTO fromStepDTO1 = new FromStepDTO();
        fromStepDTO1.setId(1L);
        FromStepDTO fromStepDTO2 = new FromStepDTO();
        assertThat(fromStepDTO1).isNotEqualTo(fromStepDTO2);
        fromStepDTO2.setId(fromStepDTO1.getId());
        assertThat(fromStepDTO1).isEqualTo(fromStepDTO2);
        fromStepDTO2.setId(2L);
        assertThat(fromStepDTO1).isNotEqualTo(fromStepDTO2);
        fromStepDTO1.setId(null);
        assertThat(fromStepDTO1).isNotEqualTo(fromStepDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(fromStepMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(fromStepMapper.fromId(null)).isNull();
    }
}
