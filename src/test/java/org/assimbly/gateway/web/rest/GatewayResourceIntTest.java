package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.Gateway;
import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.service.dto.GatewayDTO;
import org.assimbly.gateway.service.mapper.GatewayMapper;
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

import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
/**
 * Test class for the GatewayResource REST controller.
 *
 * @see GatewayResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class GatewayResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final GatewayType DEFAULT_TYPE = GatewayType.ADAPTER;
    private static final GatewayType UPDATED_TYPE = GatewayType.BROKER;

    private static final String DEFAULT_ENVIRONMENT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_ENVIRONMENT_NAME = "BBBBBBBBBB";

    private static final EnvironmentType DEFAULT_STAGE = EnvironmentType.DEVELOPMENT;
    private static final EnvironmentType UPDATED_STAGE = EnvironmentType.TEST;

    private static final String DEFAULT_DEFAULT_FROM_ENDPOINT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_DEFAULT_FROM_ENDPOINT_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_DEFAULT_TO_ENDPOINT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_DEFAULT_TO_ENDPOINT_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_DEFAULT_ERROR_ENDPOINT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_DEFAULT_ERROR_ENDPOINT_TYPE = "BBBBBBBBBB";

    @Autowired
    private GatewayRepository gatewayRepository;

    @Autowired
    private GatewayMapper gatewayMapper;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restGatewayMockMvc;

    private Gateway gateway;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final GatewayResource gatewayResource = new GatewayResource(gatewayRepository, gatewayMapper);
        this.restGatewayMockMvc = MockMvcBuilders.standaloneSetup(gatewayResource)
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
    public static Gateway createEntity(EntityManager em) {
        Gateway gateway = new Gateway()
            .name(DEFAULT_NAME)
            .type(DEFAULT_TYPE)
            .environmentName(DEFAULT_ENVIRONMENT_NAME)
            .stage(DEFAULT_STAGE)
            .defaultFromEndpointType(DEFAULT_DEFAULT_FROM_ENDPOINT_TYPE)
            .defaultToEndpointType(DEFAULT_DEFAULT_TO_ENDPOINT_TYPE)
            .defaultErrorEndpointType(DEFAULT_DEFAULT_ERROR_ENDPOINT_TYPE);
        return gateway;
    }

    @Before
    public void initTest() {
        gateway = createEntity(em);
    }

    @Test
    @Transactional
    public void createGateway() throws Exception {
        int databaseSizeBeforeCreate = gatewayRepository.findAll().size();

        // Create the Gateway
        GatewayDTO gatewayDTO = gatewayMapper.toDto(gateway);
        restGatewayMockMvc.perform(post("/api/gateways")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(gatewayDTO)))
            .andExpect(status().isCreated());

        // Validate the Gateway in the database
        List<Gateway> gatewayList = gatewayRepository.findAll();
        assertThat(gatewayList).hasSize(databaseSizeBeforeCreate + 1);
        Gateway testGateway = gatewayList.get(gatewayList.size() - 1);
        assertThat(testGateway.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testGateway.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testGateway.getEnvironmentName()).isEqualTo(DEFAULT_ENVIRONMENT_NAME);
        assertThat(testGateway.getStage()).isEqualTo(DEFAULT_STAGE);
        assertThat(testGateway.getDefaultFromEndpointType()).isEqualTo(DEFAULT_DEFAULT_FROM_ENDPOINT_TYPE);
        assertThat(testGateway.getDefaultToEndpointType()).isEqualTo(DEFAULT_DEFAULT_TO_ENDPOINT_TYPE);
        assertThat(testGateway.getDefaultErrorEndpointType()).isEqualTo(DEFAULT_DEFAULT_ERROR_ENDPOINT_TYPE);
    }

    @Test
    @Transactional
    public void createGatewayWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = gatewayRepository.findAll().size();

        // Create the Gateway with an existing ID
        gateway.setId(1L);
        GatewayDTO gatewayDTO = gatewayMapper.toDto(gateway);

        // An entity with an existing ID cannot be created, so this API call must fail
        restGatewayMockMvc.perform(post("/api/gateways")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(gatewayDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Gateway in the database
        List<Gateway> gatewayList = gatewayRepository.findAll();
        assertThat(gatewayList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllGateways() throws Exception {
        // Initialize the database
        gatewayRepository.saveAndFlush(gateway);

        // Get all the gatewayList
        restGatewayMockMvc.perform(get("/api/gateways?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(gateway.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].environmentName").value(hasItem(DEFAULT_ENVIRONMENT_NAME.toString())))
            .andExpect(jsonPath("$.[*].stage").value(hasItem(DEFAULT_STAGE.toString())))
            .andExpect(jsonPath("$.[*].defaultFromEndpointType").value(hasItem(DEFAULT_DEFAULT_FROM_ENDPOINT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].defaultToEndpointType").value(hasItem(DEFAULT_DEFAULT_TO_ENDPOINT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].defaultErrorEndpointType").value(hasItem(DEFAULT_DEFAULT_ERROR_ENDPOINT_TYPE.toString())));
    }

    @Test
    @Transactional
    public void getGateway() throws Exception {
        // Initialize the database
        gatewayRepository.saveAndFlush(gateway);

        // Get the gateway
        restGatewayMockMvc.perform(get("/api/gateways/{id}", gateway.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(gateway.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.environmentName").value(DEFAULT_ENVIRONMENT_NAME.toString()))
            .andExpect(jsonPath("$.stage").value(DEFAULT_STAGE.toString()))
            .andExpect(jsonPath("$.defaultFromEndpointType").value(DEFAULT_DEFAULT_FROM_ENDPOINT_TYPE.toString()))
            .andExpect(jsonPath("$.defaultToEndpointType").value(DEFAULT_DEFAULT_TO_ENDPOINT_TYPE.toString()))
            .andExpect(jsonPath("$.defaultErrorEndpointType").value(DEFAULT_DEFAULT_ERROR_ENDPOINT_TYPE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingGateway() throws Exception {
        // Get the gateway
        restGatewayMockMvc.perform(get("/api/gateways/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateGateway() throws Exception {
        // Initialize the database
        gatewayRepository.saveAndFlush(gateway);
        int databaseSizeBeforeUpdate = gatewayRepository.findAll().size();

        // Update the gateway
        Gateway updatedGateway = gatewayRepository.findOne(gateway.getId());
        // Disconnect from session so that the updates on updatedGateway are not directly saved in db
        em.detach(updatedGateway);
        updatedGateway
            .name(UPDATED_NAME)
            .type(UPDATED_TYPE)
            .environmentName(UPDATED_ENVIRONMENT_NAME)
            .stage(UPDATED_STAGE)
            .defaultFromEndpointType(UPDATED_DEFAULT_FROM_ENDPOINT_TYPE)
            .defaultToEndpointType(UPDATED_DEFAULT_TO_ENDPOINT_TYPE)
            .defaultErrorEndpointType(UPDATED_DEFAULT_ERROR_ENDPOINT_TYPE);
        GatewayDTO gatewayDTO = gatewayMapper.toDto(updatedGateway);

        restGatewayMockMvc.perform(put("/api/gateways")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(gatewayDTO)))
            .andExpect(status().isOk());

        // Validate the Gateway in the database
        List<Gateway> gatewayList = gatewayRepository.findAll();
        assertThat(gatewayList).hasSize(databaseSizeBeforeUpdate);
        Gateway testGateway = gatewayList.get(gatewayList.size() - 1);
        assertThat(testGateway.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testGateway.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testGateway.getEnvironmentName()).isEqualTo(UPDATED_ENVIRONMENT_NAME);
        assertThat(testGateway.getStage()).isEqualTo(UPDATED_STAGE);
        assertThat(testGateway.getDefaultFromEndpointType()).isEqualTo(UPDATED_DEFAULT_FROM_ENDPOINT_TYPE);
        assertThat(testGateway.getDefaultToEndpointType()).isEqualTo(UPDATED_DEFAULT_TO_ENDPOINT_TYPE);
        assertThat(testGateway.getDefaultErrorEndpointType()).isEqualTo(UPDATED_DEFAULT_ERROR_ENDPOINT_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingGateway() throws Exception {
        int databaseSizeBeforeUpdate = gatewayRepository.findAll().size();

        // Create the Gateway
        GatewayDTO gatewayDTO = gatewayMapper.toDto(gateway);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restGatewayMockMvc.perform(put("/api/gateways")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(gatewayDTO)))
            .andExpect(status().isCreated());

        // Validate the Gateway in the database
        List<Gateway> gatewayList = gatewayRepository.findAll();
        assertThat(gatewayList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteGateway() throws Exception {
        // Initialize the database
        gatewayRepository.saveAndFlush(gateway);
        int databaseSizeBeforeDelete = gatewayRepository.findAll().size();

        // Get the gateway
        restGatewayMockMvc.perform(delete("/api/gateways/{id}", gateway.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Gateway> gatewayList = gatewayRepository.findAll();
        assertThat(gatewayList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Gateway.class);
        Gateway gateway1 = new Gateway();
        gateway1.setId(1L);
        Gateway gateway2 = new Gateway();
        gateway2.setId(gateway1.getId());
        assertThat(gateway1).isEqualTo(gateway2);
        gateway2.setId(2L);
        assertThat(gateway1).isNotEqualTo(gateway2);
        gateway1.setId(null);
        assertThat(gateway1).isNotEqualTo(gateway2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(GatewayDTO.class);
        GatewayDTO gatewayDTO1 = new GatewayDTO();
        gatewayDTO1.setId(1L);
        GatewayDTO gatewayDTO2 = new GatewayDTO();
        assertThat(gatewayDTO1).isNotEqualTo(gatewayDTO2);
        gatewayDTO2.setId(gatewayDTO1.getId());
        assertThat(gatewayDTO1).isEqualTo(gatewayDTO2);
        gatewayDTO2.setId(2L);
        assertThat(gatewayDTO1).isNotEqualTo(gatewayDTO2);
        gatewayDTO1.setId(null);
        assertThat(gatewayDTO1).isNotEqualTo(gatewayDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(gatewayMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(gatewayMapper.fromId(null)).isNull();
    }
}
