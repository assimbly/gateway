package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.ServiceKeys;
import org.assimbly.gateway.repository.ServiceKeysRepository;
import org.assimbly.gateway.service.dto.ServiceKeysDTO;
import org.assimbly.gateway.service.mapper.ServiceKeysMapper;
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

/**
 * Test class for the ServiceKeysResource REST controller.
 *
 * @see ServiceKeysResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class ServiceKeysResourceIntTest {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    @Autowired
    private ServiceKeysRepository serviceKeysRepository;

    @Autowired
    private ServiceKeysMapper serviceKeysMapper;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restServiceKeysMockMvc;

    private ServiceKeys serviceKeys;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ServiceKeysResource headerKeysResource = new ServiceKeysResource(serviceKeysRepository, serviceKeysMapper);
        this.restServiceKeysMockMvc = MockMvcBuilders.standaloneSetup(headerKeysResource)
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
    public static ServiceKeys createEntity(EntityManager em) {
        ServiceKeys serviceKeys = new ServiceKeys()
            .key(DEFAULT_KEY)
            .value(DEFAULT_VALUE);
        return serviceKeys;
    }

    @Before
    public void initTest() {
        serviceKeys = createEntity(em);
    }

    @Test
    @Transactional
    public void createServiceKeys() throws Exception {
        int databaseSizeBeforeCreate = serviceKeysRepository.findAll().size();

        // Create the ServiceKeys
        ServiceKeysDTO serviceKeysDTO = serviceKeysMapper.toDto(serviceKeys);
        restServiceKeysMockMvc.perform(post("/api/service-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(serviceKeysDTO)))
            .andExpect(status().isCreated());

        // Validate the ServiceKeys in the database
        List<ServiceKeys> serviceKeysList = serviceKeysRepository.findAll();
        assertThat(serviceKeysList).hasSize(databaseSizeBeforeCreate + 1);
        ServiceKeys testServiceKeys = serviceKeysList.get(serviceKeysList.size() - 1);
        assertThat(testServiceKeys.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testServiceKeys.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    @Transactional
    public void createServiceKeysWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = serviceKeysRepository.findAll().size();

        // Create the ServiceKeys with an existing ID
        serviceKeys.setId(1L);
        ServiceKeysDTO serviceKeysDTO = serviceKeysMapper.toDto(serviceKeys);

        // An entity with an existing ID cannot be created, so this API call must fail
        restServiceKeysMockMvc.perform(post("/api/service-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(serviceKeysDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ServiceKeys in the database
        List<ServiceKeys> serviceKeysList = serviceKeysRepository.findAll();
        assertThat(serviceKeysList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllServiceKeys() throws Exception {
        // Initialize the database
        serviceKeysRepository.saveAndFlush(serviceKeys);

        // Get all the serviceKeysList
        restServiceKeysMockMvc.perform(get("/api/service-keys?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(serviceKeys.getId().intValue())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY.toString())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE.toString())));
    }

    @Test
    @Transactional
    public void getServiceKeys() throws Exception {
        // Initialize the database
        serviceKeysRepository.saveAndFlush(serviceKeys);

        // Get the serviceKeys
        restServiceKeysMockMvc.perform(get("/api/service-keys/{id}", serviceKeys.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(serviceKeys.getId().intValue()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY.toString()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingServiceKeys() throws Exception {
        // Get the serviceKeys
        restServiceKeysMockMvc.perform(get("/api/service-keys/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateServiceKeys() throws Exception {
        // Initialize the database
        serviceKeysRepository.saveAndFlush(serviceKeys);
        int databaseSizeBeforeUpdate = serviceKeysRepository.findAll().size();

        // Update the serviceKeys
        ServiceKeys updatedServiceKeys = serviceKeysRepository.findOne(serviceKeys.getId());
        // Disconnect from session so that the updates on updatedServiceKeys are not directly saved in db
        em.detach(updatedServiceKeys);
        updatedServiceKeys
            .key(UPDATED_KEY)
            .value(UPDATED_VALUE);
        ServiceKeysDTO serviceKeysDTO = serviceKeysMapper.toDto(updatedServiceKeys);

        restServiceKeysMockMvc.perform(put("/api/service-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(serviceKeysDTO)))
            .andExpect(status().isOk());

        // Validate the ServiceKeys in the database
        List<ServiceKeys> serviceKeysList = serviceKeysRepository.findAll();
        assertThat(serviceKeysList).hasSize(databaseSizeBeforeUpdate);
        ServiceKeys testServiceKeys = serviceKeysList.get(serviceKeysList.size() - 1);
        assertThat(testServiceKeys.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testServiceKeys.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    @Transactional
    public void updateNonExistingServiceKeys() throws Exception {
        int databaseSizeBeforeUpdate = serviceKeysRepository.findAll().size();

        // Create the ServiceKeys
        ServiceKeysDTO serviceKeysDTO = serviceKeysMapper.toDto(serviceKeys);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restServiceKeysMockMvc.perform(put("/api/service-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(serviceKeysDTO)))
            .andExpect(status().isCreated());

        // Validate the ServiceKeys in the database
        List<ServiceKeys> serviceKeysList = serviceKeysRepository.findAll();
        assertThat(serviceKeysList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteServiceKeys() throws Exception {
        // Initialize the database
        serviceKeysRepository.saveAndFlush(serviceKeys);
        int databaseSizeBeforeDelete = serviceKeysRepository.findAll().size();

        // Get the serviceKeys
        restServiceKeysMockMvc.perform(delete("/api/service-keys/{id}", serviceKeys.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ServiceKeys> serviceKeysList = serviceKeysRepository.findAll();
        assertThat(serviceKeysList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ServiceKeys.class);
        ServiceKeys serviceKeys1 = new ServiceKeys();
        serviceKeys1.setId(1L);
        ServiceKeys serviceKeys2 = new ServiceKeys();
        serviceKeys2.setId(serviceKeys1.getId());
        assertThat(serviceKeys1).isEqualTo(serviceKeys2);
        serviceKeys2.setId(2L);
        assertThat(serviceKeys1).isNotEqualTo(serviceKeys2);
        serviceKeys1.setId(null);
        assertThat(serviceKeys1).isNotEqualTo(serviceKeys2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ServiceKeysDTO.class);
        ServiceKeysDTO serviceKeysDTO1 = new ServiceKeysDTO();
        serviceKeysDTO1.setId(1L);
        ServiceKeysDTO serviceKeysDTO2 = new ServiceKeysDTO();
        assertThat(serviceKeysDTO1).isNotEqualTo(serviceKeysDTO2);
        serviceKeysDTO2.setId(serviceKeysDTO1.getId());
        assertThat(serviceKeysDTO1).isEqualTo(serviceKeysDTO2);
        serviceKeysDTO2.setId(2L);
        assertThat(serviceKeysDTO1).isNotEqualTo(serviceKeysDTO2);
        serviceKeysDTO1.setId(null);
        assertThat(serviceKeysDTO1).isNotEqualTo(serviceKeysDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(serviceKeysMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(serviceKeysMapper.fromId(null)).isNull();
    }
}
