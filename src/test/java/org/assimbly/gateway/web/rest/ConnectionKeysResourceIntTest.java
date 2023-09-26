package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.ConnectionKeys;
import org.assimbly.gateway.repository.ConnectionKeysRepository;
import org.assimbly.gateway.service.ConnectionKeysService;
import org.assimbly.gateway.service.dto.ConnectionKeysDTO;
import org.assimbly.gateway.service.mapper.ConnectionKeysMapper;
import org.assimbly.gateway.web.rest.errors.ExceptionTranslator;

import org.assimbly.gateway.web.rest.integration.ConnectionKeysResource;
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
 * Test class for the ConnectionKeysResource REST controller.
 *
 * @see ConnectionKeysResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class ConnectionKeysResourceIntTest {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    @Autowired
    private ConnectionKeysRepository connectionKeysRepository;

    @Autowired
    private ConnectionKeysMapper connectionKeysMapper;

    @Autowired
    private ConnectionKeysService connectionKeysService;

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

    private MockMvc restConnectionKeysMockMvc;

    private ConnectionKeys connectionKeys;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ConnectionKeysResource connectionKeysResource = new ConnectionKeysResource(connectionKeysService);
        this.restConnectionKeysMockMvc = MockMvcBuilders.standaloneSetup(connectionKeysResource)
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
    public static ConnectionKeys createEntity(EntityManager em) {
        ConnectionKeys connectionKeys = new ConnectionKeys()
            .key(DEFAULT_KEY)
            .value(DEFAULT_VALUE)
            .type(DEFAULT_TYPE);
        return connectionKeys;
    }

    @Before
    public void initTest() {
        connectionKeys = createEntity(em);
    }

    @Test
    @Transactional
    public void createConnectionKeys() throws Exception {
        int databaseSizeBeforeCreate = connectionKeysRepository.findAll().size();

        // Create the ConnectionKeys
        ConnectionKeysDTO connectionKeysDTO = connectionKeysMapper.toDto(connectionKeys);
        restConnectionKeysMockMvc.perform(post("/api/connection-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(connectionKeysDTO)))
            .andExpect(status().isCreated());

        // Validate the ConnectionKeys in the database
        List<ConnectionKeys> connectionKeysList = connectionKeysRepository.findAll();
        assertThat(connectionKeysList).hasSize(databaseSizeBeforeCreate + 1);
        ConnectionKeys testConnectionKeys = connectionKeysList.get(connectionKeysList.size() - 1);
        assertThat(testConnectionKeys.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testConnectionKeys.getValue()).isEqualTo(DEFAULT_VALUE);
        assertThat(testConnectionKeys.getType()).isEqualTo(DEFAULT_TYPE);
    }

    @Test
    @Transactional
    public void createConnectionKeysWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = connectionKeysRepository.findAll().size();

        // Create the ConnectionKeys with an existing ID
        connectionKeys.setId(1L);
        ConnectionKeysDTO connectionKeysDTO = connectionKeysMapper.toDto(connectionKeys);

        // An entity with an existing ID cannot be created, so this API call must fail
        restConnectionKeysMockMvc.perform(post("/api/connection-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(connectionKeysDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ConnectionKeys in the database
        List<ConnectionKeys> connectionKeysList = connectionKeysRepository.findAll();
        assertThat(connectionKeysList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllConnectionKeys() throws Exception {
        // Initialize the database
        connectionKeysRepository.saveAndFlush(connectionKeys);

        // Get all the connectionKeysList
        restConnectionKeysMockMvc.perform(get("/api/connection-keys?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(connectionKeys.getId().intValue())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY)))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)));
    }

    @Test
    @Transactional
    public void getConnectionKeys() throws Exception {
        // Initialize the database
        connectionKeysRepository.saveAndFlush(connectionKeys);

        // Get the connectionKeys
        restConnectionKeysMockMvc.perform(get("/api/connection-keys/{id}", connectionKeys.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(connectionKeys.getId().intValue()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE));
    }

    @Test
    @Transactional
    public void getNonExistingConnectionKeys() throws Exception {
        // Get the connectionKeys
        restConnectionKeysMockMvc.perform(get("/api/connection-keys/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateConnectionKeys() throws Exception {
        // Initialize the database
        connectionKeysRepository.saveAndFlush(connectionKeys);

        int databaseSizeBeforeUpdate = connectionKeysRepository.findAll().size();

        // Update the connectionKeys
        ConnectionKeys updatedConnectionKeys = connectionKeysRepository.findById(connectionKeys.getId()).get();
        // Disconnect from session so that the updates on updatedConnectionKeys are not directly saved in db
        em.detach(updatedConnectionKeys);
        updatedConnectionKeys
            .key(UPDATED_KEY)
            .value(UPDATED_VALUE)
            .type(UPDATED_TYPE);
        ConnectionKeysDTO connectionKeysDTO = connectionKeysMapper.toDto(updatedConnectionKeys);

        restConnectionKeysMockMvc.perform(put("/api/connection-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(connectionKeysDTO)))
            .andExpect(status().isOk());

        // Validate the ConnectionKeys in the database
        List<ConnectionKeys> connectionKeysList = connectionKeysRepository.findAll();
        assertThat(connectionKeysList).hasSize(databaseSizeBeforeUpdate);
        ConnectionKeys testConnectionKeys = connectionKeysList.get(connectionKeysList.size() - 1);
        assertThat(testConnectionKeys.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testConnectionKeys.getValue()).isEqualTo(UPDATED_VALUE);
        assertThat(testConnectionKeys.getType()).isEqualTo(UPDATED_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingConnectionKeys() throws Exception {
        int databaseSizeBeforeUpdate = connectionKeysRepository.findAll().size();

        // Create the ConnectionKeys
        ConnectionKeysDTO connectionKeysDTO = connectionKeysMapper.toDto(connectionKeys);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConnectionKeysMockMvc.perform(put("/api/connection-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(connectionKeysDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ConnectionKeys in the database
        List<ConnectionKeys> connectionKeysList = connectionKeysRepository.findAll();
        assertThat(connectionKeysList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteConnectionKeys() throws Exception {
        // Initialize the database
        connectionKeysRepository.saveAndFlush(connectionKeys);

        int databaseSizeBeforeDelete = connectionKeysRepository.findAll().size();

        // Get the connectionKeys
        restConnectionKeysMockMvc.perform(delete("/api/connection-keys/{id}", connectionKeys.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ConnectionKeys> connectionKeysList = connectionKeysRepository.findAll();
        assertThat(connectionKeysList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ConnectionKeys.class);
        ConnectionKeys connectionKeys1 = new ConnectionKeys();
        connectionKeys1.setId(1L);
        ConnectionKeys connectionKeys2 = new ConnectionKeys();
        connectionKeys2.setId(connectionKeys1.getId());
        assertThat(connectionKeys1).isEqualTo(connectionKeys2);
        connectionKeys2.setId(2L);
        assertThat(connectionKeys1).isNotEqualTo(connectionKeys2);
        connectionKeys1.setId(null);
        assertThat(connectionKeys1).isNotEqualTo(connectionKeys2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ConnectionKeysDTO.class);
        ConnectionKeysDTO connectionKeysDTO1 = new ConnectionKeysDTO();
        connectionKeysDTO1.setId(1L);
        ConnectionKeysDTO connectionKeysDTO2 = new ConnectionKeysDTO();
        assertThat(connectionKeysDTO1).isNotEqualTo(connectionKeysDTO2);
        connectionKeysDTO2.setId(connectionKeysDTO1.getId());
        assertThat(connectionKeysDTO1).isEqualTo(connectionKeysDTO2);
        connectionKeysDTO2.setId(2L);
        assertThat(connectionKeysDTO1).isNotEqualTo(connectionKeysDTO2);
        connectionKeysDTO1.setId(null);
        assertThat(connectionKeysDTO1).isNotEqualTo(connectionKeysDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(connectionKeysMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(connectionKeysMapper.fromId(null)).isNull();
    }
}
