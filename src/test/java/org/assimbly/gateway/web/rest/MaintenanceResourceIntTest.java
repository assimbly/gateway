package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.Maintenance;
import org.assimbly.gateway.repository.MaintenanceRepository;
import org.assimbly.gateway.service.MaintenanceService;
import org.assimbly.gateway.service.dto.MaintenanceDTO;
import org.assimbly.gateway.service.mapper.MaintenanceMapper;
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
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;


import static org.assimbly.gateway.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the MaintenanceResource REST controller.
 *
 * @see MaintenanceResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class MaintenanceResourceIntTest {

    private static final Instant DEFAULT_START_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_START_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_END_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_END_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private MaintenanceMapper maintenanceMapper;

    @Autowired
    private MaintenanceService maintenanceService;

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

    private MockMvc restMaintenanceMockMvc;

    private Maintenance maintenance;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final MaintenanceResource maintenanceResource = new MaintenanceResource(maintenanceService);
        this.restMaintenanceMockMvc = MockMvcBuilders.standaloneSetup(maintenanceResource)
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
    public static Maintenance createEntity(EntityManager em) {
        Maintenance maintenance = new Maintenance()
            .startTime(DEFAULT_START_TIME)
            .endTime(DEFAULT_END_TIME);
        return maintenance;
    }

    @Before
    public void initTest() {
        maintenance = createEntity(em);
    }

    @Test
    @Transactional
    public void createMaintenance() throws Exception {
        int databaseSizeBeforeCreate = maintenanceRepository.findAll().size();

        // Create the Maintenance
        MaintenanceDTO maintenanceDTO = maintenanceMapper.toDto(maintenance);
        restMaintenanceMockMvc.perform(post("/api/maintenances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(maintenanceDTO)))
            .andExpect(status().isCreated());

        // Validate the Maintenance in the database
        List<Maintenance> maintenanceList = maintenanceRepository.findAll();
        assertThat(maintenanceList).hasSize(databaseSizeBeforeCreate + 1);
        Maintenance testMaintenance = maintenanceList.get(maintenanceList.size() - 1);
        assertThat(testMaintenance.getStartTime()).isEqualTo(DEFAULT_START_TIME);
        assertThat(testMaintenance.getEndTime()).isEqualTo(DEFAULT_END_TIME);
    }

    @Test
    @Transactional
    public void createMaintenanceWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = maintenanceRepository.findAll().size();

        // Create the Maintenance with an existing ID
        maintenance.setId(1L);
        MaintenanceDTO maintenanceDTO = maintenanceMapper.toDto(maintenance);

        // An entity with an existing ID cannot be created, so this API call must fail
        restMaintenanceMockMvc.perform(post("/api/maintenances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(maintenanceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Maintenance in the database
        List<Maintenance> maintenanceList = maintenanceRepository.findAll();
        assertThat(maintenanceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllMaintenances() throws Exception {
        // Initialize the database
        maintenanceRepository.saveAndFlush(maintenance);

        // Get all the maintenanceList
        restMaintenanceMockMvc.perform(get("/api/maintenances?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(maintenance.getId().intValue())))
            .andExpect(jsonPath("$.[*].startTime").value(hasItem(DEFAULT_START_TIME.toString())))
            .andExpect(jsonPath("$.[*].endTime").value(hasItem(DEFAULT_END_TIME.toString())));
    }
    
    @Test
    @Transactional
    public void getMaintenance() throws Exception {
        // Initialize the database
        maintenanceRepository.saveAndFlush(maintenance);

        // Get the maintenance
        restMaintenanceMockMvc.perform(get("/api/maintenances/{id}", maintenance.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(maintenance.getId().intValue()))
            .andExpect(jsonPath("$.startTime").value(DEFAULT_START_TIME.toString()))
            .andExpect(jsonPath("$.endTime").value(DEFAULT_END_TIME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingMaintenance() throws Exception {
        // Get the maintenance
        restMaintenanceMockMvc.perform(get("/api/maintenances/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateMaintenance() throws Exception {
        // Initialize the database
        maintenanceRepository.saveAndFlush(maintenance);

        int databaseSizeBeforeUpdate = maintenanceRepository.findAll().size();

        // Update the maintenance
        Maintenance updatedMaintenance = maintenanceRepository.findById(maintenance.getId()).get();
        // Disconnect from session so that the updates on updatedMaintenance are not directly saved in db
        em.detach(updatedMaintenance);
        updatedMaintenance
            .startTime(UPDATED_START_TIME)
            .endTime(UPDATED_END_TIME);
        MaintenanceDTO maintenanceDTO = maintenanceMapper.toDto(updatedMaintenance);

        restMaintenanceMockMvc.perform(put("/api/maintenances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(maintenanceDTO)))
            .andExpect(status().isOk());

        // Validate the Maintenance in the database
        List<Maintenance> maintenanceList = maintenanceRepository.findAll();
        assertThat(maintenanceList).hasSize(databaseSizeBeforeUpdate);
        Maintenance testMaintenance = maintenanceList.get(maintenanceList.size() - 1);
        assertThat(testMaintenance.getStartTime()).isEqualTo(UPDATED_START_TIME);
        assertThat(testMaintenance.getEndTime()).isEqualTo(UPDATED_END_TIME);
    }

    @Test
    @Transactional
    public void updateNonExistingMaintenance() throws Exception {
        int databaseSizeBeforeUpdate = maintenanceRepository.findAll().size();

        // Create the Maintenance
        MaintenanceDTO maintenanceDTO = maintenanceMapper.toDto(maintenance);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMaintenanceMockMvc.perform(put("/api/maintenances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(maintenanceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Maintenance in the database
        List<Maintenance> maintenanceList = maintenanceRepository.findAll();
        assertThat(maintenanceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteMaintenance() throws Exception {
        // Initialize the database
        maintenanceRepository.saveAndFlush(maintenance);

        int databaseSizeBeforeDelete = maintenanceRepository.findAll().size();

        // Get the maintenance
        restMaintenanceMockMvc.perform(delete("/api/maintenances/{id}", maintenance.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Maintenance> maintenanceList = maintenanceRepository.findAll();
        assertThat(maintenanceList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Maintenance.class);
        Maintenance maintenance1 = new Maintenance();
        maintenance1.setId(1L);
        Maintenance maintenance2 = new Maintenance();
        maintenance2.setId(maintenance1.getId());
        assertThat(maintenance1).isEqualTo(maintenance2);
        maintenance2.setId(2L);
        assertThat(maintenance1).isNotEqualTo(maintenance2);
        maintenance1.setId(null);
        assertThat(maintenance1).isNotEqualTo(maintenance2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(MaintenanceDTO.class);
        MaintenanceDTO maintenanceDTO1 = new MaintenanceDTO();
        maintenanceDTO1.setId(1L);
        MaintenanceDTO maintenanceDTO2 = new MaintenanceDTO();
        assertThat(maintenanceDTO1).isNotEqualTo(maintenanceDTO2);
        maintenanceDTO2.setId(maintenanceDTO1.getId());
        assertThat(maintenanceDTO1).isEqualTo(maintenanceDTO2);
        maintenanceDTO2.setId(2L);
        assertThat(maintenanceDTO1).isNotEqualTo(maintenanceDTO2);
        maintenanceDTO1.setId(null);
        assertThat(maintenanceDTO1).isNotEqualTo(maintenanceDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(maintenanceMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(maintenanceMapper.fromId(null)).isNull();
    }
}
