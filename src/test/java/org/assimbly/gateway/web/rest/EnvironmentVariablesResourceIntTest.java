package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.service.EnvironmentVariablesService;
import org.assimbly.gateway.service.dto.EnvironmentVariablesDTO;
import org.assimbly.gateway.service.mapper.EnvironmentVariablesMapper;
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
 * Test class for the EnvironmentVariablesResource REST controller.
 *
 * @see EnvironmentVariablesResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class EnvironmentVariablesResourceIntTest {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    @Autowired
    private EnvironmentVariablesRepository environmentVariablesRepository;

    @Autowired
    private EnvironmentVariablesMapper environmentVariablesMapper;

    @Autowired
    private EnvironmentVariablesService environmentVariablesService;

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

    private MockMvc restEnvironmentVariablesMockMvc;

    private EnvironmentVariables environmentVariables;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final EnvironmentVariablesResource environmentVariablesResource = new EnvironmentVariablesResource(environmentVariablesService);
        this.restEnvironmentVariablesMockMvc = MockMvcBuilders.standaloneSetup(environmentVariablesResource)
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
    public static EnvironmentVariables createEntity(EntityManager em) {
        EnvironmentVariables environmentVariables = new EnvironmentVariables()
            .key(DEFAULT_KEY)
            .value(DEFAULT_VALUE);
        return environmentVariables;
    }

    @Before
    public void initTest() {
        environmentVariables = createEntity(em);
    }

    @Test
    @Transactional
    public void createEnvironmentVariables() throws Exception {
        int databaseSizeBeforeCreate = environmentVariablesRepository.findAll().size();

        // Create the EnvironmentVariables
        EnvironmentVariablesDTO environmentVariablesDTO = environmentVariablesMapper.toDto(environmentVariables);
        restEnvironmentVariablesMockMvc.perform(post("/api/environment-variables")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(environmentVariablesDTO)))
            .andExpect(status().isCreated());

        // Validate the EnvironmentVariables in the database
        List<EnvironmentVariables> environmentVariablesList = environmentVariablesRepository.findAll();
        assertThat(environmentVariablesList).hasSize(databaseSizeBeforeCreate + 1);
        EnvironmentVariables testEnvironmentVariables = environmentVariablesList.get(environmentVariablesList.size() - 1);
        assertThat(testEnvironmentVariables.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testEnvironmentVariables.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    @Transactional
    public void createEnvironmentVariablesWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = environmentVariablesRepository.findAll().size();

        // Create the EnvironmentVariables with an existing ID
        environmentVariables.setId(1L);
        EnvironmentVariablesDTO environmentVariablesDTO = environmentVariablesMapper.toDto(environmentVariables);

        // An entity with an existing ID cannot be created, so this API call must fail
        restEnvironmentVariablesMockMvc.perform(post("/api/environment-variables")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(environmentVariablesDTO)))
            .andExpect(status().isBadRequest());

        // Validate the EnvironmentVariables in the database
        List<EnvironmentVariables> environmentVariablesList = environmentVariablesRepository.findAll();
        assertThat(environmentVariablesList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllEnvironmentVariables() throws Exception {
        // Initialize the database
        environmentVariablesRepository.saveAndFlush(environmentVariables);

        // Get all the environmentVariablesList
        restEnvironmentVariablesMockMvc.perform(get("/api/environment-variables?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(environmentVariables.getId().intValue())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY.toString())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE.toString())));
    }
    
    @Test
    @Transactional
    public void getEnvironmentVariables() throws Exception {
        // Initialize the database
        environmentVariablesRepository.saveAndFlush(environmentVariables);

        // Get the environmentVariables
        restEnvironmentVariablesMockMvc.perform(get("/api/environment-variables/{id}", environmentVariables.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(environmentVariables.getId().intValue()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY.toString()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingEnvironmentVariables() throws Exception {
        // Get the environmentVariables
        restEnvironmentVariablesMockMvc.perform(get("/api/environment-variables/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateEnvironmentVariables() throws Exception {
        // Initialize the database
        environmentVariablesRepository.saveAndFlush(environmentVariables);

        int databaseSizeBeforeUpdate = environmentVariablesRepository.findAll().size();

        // Update the environmentVariables
        EnvironmentVariables updatedEnvironmentVariables = environmentVariablesRepository.findById(environmentVariables.getId()).get();
        // Disconnect from session so that the updates on updatedEnvironmentVariables are not directly saved in db
        em.detach(updatedEnvironmentVariables);
        updatedEnvironmentVariables
            .key(UPDATED_KEY)
            .value(UPDATED_VALUE);
        EnvironmentVariablesDTO environmentVariablesDTO = environmentVariablesMapper.toDto(updatedEnvironmentVariables);

        restEnvironmentVariablesMockMvc.perform(put("/api/environment-variables")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(environmentVariablesDTO)))
            .andExpect(status().isOk());

        // Validate the EnvironmentVariables in the database
        List<EnvironmentVariables> environmentVariablesList = environmentVariablesRepository.findAll();
        assertThat(environmentVariablesList).hasSize(databaseSizeBeforeUpdate);
        EnvironmentVariables testEnvironmentVariables = environmentVariablesList.get(environmentVariablesList.size() - 1);
        assertThat(testEnvironmentVariables.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testEnvironmentVariables.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    @Transactional
    public void updateNonExistingEnvironmentVariables() throws Exception {
        int databaseSizeBeforeUpdate = environmentVariablesRepository.findAll().size();

        // Create the EnvironmentVariables
        EnvironmentVariablesDTO environmentVariablesDTO = environmentVariablesMapper.toDto(environmentVariables);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEnvironmentVariablesMockMvc.perform(put("/api/environment-variables")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(environmentVariablesDTO)))
            .andExpect(status().isBadRequest());

        // Validate the EnvironmentVariables in the database
        List<EnvironmentVariables> environmentVariablesList = environmentVariablesRepository.findAll();
        assertThat(environmentVariablesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteEnvironmentVariables() throws Exception {
        // Initialize the database
        environmentVariablesRepository.saveAndFlush(environmentVariables);

        int databaseSizeBeforeDelete = environmentVariablesRepository.findAll().size();

        // Get the environmentVariables
        restEnvironmentVariablesMockMvc.perform(delete("/api/environment-variables/{id}", environmentVariables.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<EnvironmentVariables> environmentVariablesList = environmentVariablesRepository.findAll();
        assertThat(environmentVariablesList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(EnvironmentVariables.class);
        EnvironmentVariables environmentVariables1 = new EnvironmentVariables();
        environmentVariables1.setId(1L);
        EnvironmentVariables environmentVariables2 = new EnvironmentVariables();
        environmentVariables2.setId(environmentVariables1.getId());
        assertThat(environmentVariables1).isEqualTo(environmentVariables2);
        environmentVariables2.setId(2L);
        assertThat(environmentVariables1).isNotEqualTo(environmentVariables2);
        environmentVariables1.setId(null);
        assertThat(environmentVariables1).isNotEqualTo(environmentVariables2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(EnvironmentVariablesDTO.class);
        EnvironmentVariablesDTO environmentVariablesDTO1 = new EnvironmentVariablesDTO();
        environmentVariablesDTO1.setId(1L);
        EnvironmentVariablesDTO environmentVariablesDTO2 = new EnvironmentVariablesDTO();
        assertThat(environmentVariablesDTO1).isNotEqualTo(environmentVariablesDTO2);
        environmentVariablesDTO2.setId(environmentVariablesDTO1.getId());
        assertThat(environmentVariablesDTO1).isEqualTo(environmentVariablesDTO2);
        environmentVariablesDTO2.setId(2L);
        assertThat(environmentVariablesDTO1).isNotEqualTo(environmentVariablesDTO2);
        environmentVariablesDTO1.setId(null);
        assertThat(environmentVariablesDTO1).isNotEqualTo(environmentVariablesDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(environmentVariablesMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(environmentVariablesMapper.fromId(null)).isNull();
    }
}
