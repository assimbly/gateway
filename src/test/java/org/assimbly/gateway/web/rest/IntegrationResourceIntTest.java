package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.IntegrationService;
import org.assimbly.gateway.service.dto.IntegrationDTO;
import org.assimbly.gateway.service.mapper.IntegrationMapper;
import org.assimbly.gateway.web.rest.errors.ExceptionTranslator;

import org.assimbly.gateway.web.rest.gateway.IntegrationResource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.quartz.SchedulerException;
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

import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.ConnectorType;
/**
 * Test class for the IntegrationResource REST controller.
 *
 * @see IntegrationResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class IntegrationResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final GatewayType DEFAULT_TYPE = GatewayType.FULL;
    private static final GatewayType UPDATED_TYPE = GatewayType.BROKER;

    private static final String DEFAULT_ENVIRONMENT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_ENVIRONMENT_NAME = "BBBBBBBBBB";

    private static final EnvironmentType DEFAULT_STAGE = EnvironmentType.DEVELOPMENT;
    private static final EnvironmentType UPDATED_STAGE = EnvironmentType.TEST;

    private static final ConnectorType DEFAULT_CONNECTOR_TYPE = ConnectorType.CAMEL;
    private static final ConnectorType UPDATED_CONNECTOR_TYPE = ConnectorType.SPRINGINTEGRATION;

    private static final String DEFAULT_DEFAULT_FROM_COMPONENT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_DEFAULT_FROM_COMPONENT_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_DEFAULT_TO_COMPONENT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_DEFAULT_TO_COMPONENT_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_DEFAULT_ERROR_COMPONENT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_DEFAULT_ERROR_COMPONENT_TYPE = "BBBBBBBBBB";

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private IntegrationMapper integrationMapper;

    @Autowired
    private IntegrationService integrationService;

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

    private MockMvc restIntegrationMockMvc;

    private Integration integration;

    @Before
    public void setup() throws SchedulerException {
        MockitoAnnotations.initMocks(this);
        ApplicationProperties applicationProperties = null;
        final IntegrationResource integrationResource = new IntegrationResource(integrationService, integrationRepository, applicationProperties);
        this.restIntegrationMockMvc = MockMvcBuilders.standaloneSetup(integrationResource)
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
    public static Integration createEntity(EntityManager em) {
        Integration integration = new Integration()
            .name(DEFAULT_NAME)
            .type(DEFAULT_TYPE)
            .environmentName(DEFAULT_ENVIRONMENT_NAME)
            .stage(DEFAULT_STAGE)
            .connectorType(DEFAULT_CONNECTOR_TYPE)
            .defaultFromComponentType(DEFAULT_DEFAULT_FROM_COMPONENT_TYPE)
            .defaultToComponentType(DEFAULT_DEFAULT_TO_COMPONENT_TYPE)
            .defaultErrorComponentType(DEFAULT_DEFAULT_ERROR_COMPONENT_TYPE);
        return integration;
    }

    @Before
    public void initTest() {
        integration = createEntity(em);
    }

    @Test
    @Transactional
    public void createIntegration() throws Exception {
        int databaseSizeBeforeCreate = integrationRepository.findAll().size();

        // Create the Integration
        IntegrationDTO integrationDTO = integrationMapper.toDto(integration);
        restIntegrationMockMvc.perform(post("/api/integrations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(integrationDTO)))
            .andExpect(status().isCreated());

        // Validate the Integration in the database
        List<Integration> integrationList = integrationRepository.findAll();
        assertThat(integrationList).hasSize(databaseSizeBeforeCreate + 1);
        Integration testIntegration = integrationList.get(integrationList.size() - 1);
        assertThat(testIntegration.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testIntegration.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testIntegration.getEnvironmentName()).isEqualTo(DEFAULT_ENVIRONMENT_NAME);
        assertThat(testIntegration.getStage()).isEqualTo(DEFAULT_STAGE);
        assertThat(testIntegration.getConnectorType()).isEqualTo(DEFAULT_CONNECTOR_TYPE);
        assertThat(testIntegration.getDefaultFromComponentType()).isEqualTo(DEFAULT_DEFAULT_FROM_COMPONENT_TYPE);
        assertThat(testIntegration.getDefaultToComponentType()).isEqualTo(DEFAULT_DEFAULT_TO_COMPONENT_TYPE);
        assertThat(testIntegration.getDefaultErrorComponentType()).isEqualTo(DEFAULT_DEFAULT_ERROR_COMPONENT_TYPE);
    }

    @Test
    @Transactional
    public void createIntegrationWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = integrationRepository.findAll().size();

        // Create the Integration with an existing ID
        integration.setId(1L);
        IntegrationDTO integrationDTO = integrationMapper.toDto(integration);

        // An entity with an existing ID cannot be created, so this API call must fail
        restIntegrationMockMvc.perform(post("/api/integrations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(integrationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Integration in the database
        List<Integration> integrationList = integrationRepository.findAll();
        assertThat(integrationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllIntegrations() throws Exception {
        // Initialize the database
        integrationRepository.saveAndFlush(integration);

        // Get all the integrationList
        restIntegrationMockMvc.perform(get("/api/integrations?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(integration.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].environmentName").value(hasItem(DEFAULT_ENVIRONMENT_NAME)))
            .andExpect(jsonPath("$.[*].stage").value(hasItem(DEFAULT_STAGE.toString())))
            .andExpect(jsonPath("$.[*].connectorType").value(hasItem(DEFAULT_CONNECTOR_TYPE.toString())))
            .andExpect(jsonPath("$.[*].defaultFromComponentType").value(hasItem(DEFAULT_DEFAULT_FROM_COMPONENT_TYPE)))
            .andExpect(jsonPath("$.[*].defaultToComponentType").value(hasItem(DEFAULT_DEFAULT_TO_COMPONENT_TYPE)))
            .andExpect(jsonPath("$.[*].defaultErrorComponentType").value(hasItem(DEFAULT_DEFAULT_ERROR_COMPONENT_TYPE)));
    }

    @Test
    @Transactional
    public void getIntegration() throws Exception {
        // Initialize the database
        integrationRepository.saveAndFlush(integration);

        // Get the integration
        restIntegrationMockMvc.perform(get("/api/integrations/{id}", integration.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(integration.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.environmentName").value(DEFAULT_ENVIRONMENT_NAME))
            .andExpect(jsonPath("$.stage").value(DEFAULT_STAGE.toString()))
            .andExpect(jsonPath("$.connectorType").value(DEFAULT_CONNECTOR_TYPE.toString()))
            .andExpect(jsonPath("$.defaultFromComponentType").value(DEFAULT_DEFAULT_FROM_COMPONENT_TYPE))
            .andExpect(jsonPath("$.defaultToComponentType").value(DEFAULT_DEFAULT_TO_COMPONENT_TYPE))
            .andExpect(jsonPath("$.defaultErrorComponentType").value(DEFAULT_DEFAULT_ERROR_COMPONENT_TYPE));
    }

    @Test
    @Transactional
    public void getNonExistingIntegration() throws Exception {
        // Get the integration
        restIntegrationMockMvc.perform(get("/api/integrations/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateIntegration() throws Exception {
        // Initialize the database
        integrationRepository.saveAndFlush(integration);

        int databaseSizeBeforeUpdate = integrationRepository.findAll().size();

        // Update the integration
        Integration updatedIntegration = integrationRepository.findById(integration.getId()).get();
        // Disconnect from session so that the updates on updatedIntegration are not directly saved in db
        em.detach(updatedIntegration);
        updatedIntegration
            .name(UPDATED_NAME)
            .type(UPDATED_TYPE)
            .environmentName(UPDATED_ENVIRONMENT_NAME)
            .stage(UPDATED_STAGE)
            .connectorType(UPDATED_CONNECTOR_TYPE)
            .defaultFromComponentType(UPDATED_DEFAULT_FROM_COMPONENT_TYPE)
            .defaultToComponentType(UPDATED_DEFAULT_TO_COMPONENT_TYPE)
            .defaultErrorComponentType(UPDATED_DEFAULT_ERROR_COMPONENT_TYPE);
        IntegrationDTO integrationDTO = integrationMapper.toDto(updatedIntegration);

        restIntegrationMockMvc.perform(put("/api/integrations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(integrationDTO)))
            .andExpect(status().isOk());

        // Validate the Integration in the database
        List<Integration> integrationList = integrationRepository.findAll();
        assertThat(integrationList).hasSize(databaseSizeBeforeUpdate);
        Integration testIntegration = integrationList.get(integrationList.size() - 1);
        assertThat(testIntegration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testIntegration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testIntegration.getEnvironmentName()).isEqualTo(UPDATED_ENVIRONMENT_NAME);
        assertThat(testIntegration.getStage()).isEqualTo(UPDATED_STAGE);
        assertThat(testIntegration.getConnectorType()).isEqualTo(UPDATED_CONNECTOR_TYPE);
        assertThat(testIntegration.getDefaultFromComponentType()).isEqualTo(UPDATED_DEFAULT_FROM_COMPONENT_TYPE);
        assertThat(testIntegration.getDefaultToComponentType()).isEqualTo(UPDATED_DEFAULT_TO_COMPONENT_TYPE);
        assertThat(testIntegration.getDefaultErrorComponentType()).isEqualTo(UPDATED_DEFAULT_ERROR_COMPONENT_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingIntegration() throws Exception {
        int databaseSizeBeforeUpdate = integrationRepository.findAll().size();

        // Create the Integration
        IntegrationDTO integrationDTO = integrationMapper.toDto(integration);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restIntegrationMockMvc.perform(put("/api/integrations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(integrationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Integration in the database
        List<Integration> integrationList = integrationRepository.findAll();
        assertThat(integrationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteIntegration() throws Exception {
        // Initialize the database
        integrationRepository.saveAndFlush(integration);

        int databaseSizeBeforeDelete = integrationRepository.findAll().size();

        // Get the integration
        restIntegrationMockMvc.perform(delete("/api/integrations/{id}", integration.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Integration> integrationList = integrationRepository.findAll();
        assertThat(integrationList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Integration.class);
        Integration integration1 = new Integration();
        integration1.setId(1L);
        Integration integration2 = new Integration();
        integration2.setId(integration1.getId());
        assertThat(integration1).isEqualTo(integration2);
        integration2.setId(2L);
        assertThat(integration1).isNotEqualTo(integration2);
        integration1.setId(null);
        assertThat(integration1).isNotEqualTo(integration2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(IntegrationDTO.class);
        IntegrationDTO integrationDTO1 = new IntegrationDTO();
        integrationDTO1.setId(1L);
        IntegrationDTO integrationDTO2 = new IntegrationDTO();
        assertThat(integrationDTO1).isNotEqualTo(integrationDTO2);
        integrationDTO2.setId(integrationDTO1.getId());
        assertThat(integrationDTO1).isEqualTo(integrationDTO2);
        integrationDTO2.setId(2L);
        assertThat(integrationDTO1).isNotEqualTo(integrationDTO2);
        integrationDTO1.setId(null);
        assertThat(integrationDTO1).isNotEqualTo(integrationDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(integrationMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(integrationMapper.fromId(null)).isNull();
    }
}
