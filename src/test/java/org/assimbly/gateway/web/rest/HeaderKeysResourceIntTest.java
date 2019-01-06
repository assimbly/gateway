package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.repository.HeaderKeysRepository;
import org.assimbly.gateway.service.HeaderKeysService;
import org.assimbly.gateway.service.dto.HeaderKeysDTO;
import org.assimbly.gateway.service.mapper.HeaderKeysMapper;
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
 * Test class for the HeaderKeysResource REST controller.
 *
 * @see HeaderKeysResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class HeaderKeysResourceIntTest {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    @Autowired
    private HeaderKeysRepository headerKeysRepository;

    @Autowired
    private HeaderKeysMapper headerKeysMapper;

    @Autowired
    private HeaderKeysService headerKeysService;

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

    private MockMvc restHeaderKeysMockMvc;

    private HeaderKeys headerKeys;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final HeaderKeysResource headerKeysResource = new HeaderKeysResource(headerKeysService);
        this.restHeaderKeysMockMvc = MockMvcBuilders.standaloneSetup(headerKeysResource)
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
    public static HeaderKeys createEntity(EntityManager em) {
        HeaderKeys headerKeys = new HeaderKeys()
            .key(DEFAULT_KEY)
            .value(DEFAULT_VALUE)
            .type(DEFAULT_TYPE);
        return headerKeys;
    }

    @Before
    public void initTest() {
        headerKeys = createEntity(em);
    }

    @Test
    @Transactional
    public void createHeaderKeys() throws Exception {
        int databaseSizeBeforeCreate = headerKeysRepository.findAll().size();

        // Create the HeaderKeys
        HeaderKeysDTO headerKeysDTO = headerKeysMapper.toDto(headerKeys);
        restHeaderKeysMockMvc.perform(post("/api/header-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(headerKeysDTO)))
            .andExpect(status().isCreated());

        // Validate the HeaderKeys in the database
        List<HeaderKeys> headerKeysList = headerKeysRepository.findAll();
        assertThat(headerKeysList).hasSize(databaseSizeBeforeCreate + 1);
        HeaderKeys testHeaderKeys = headerKeysList.get(headerKeysList.size() - 1);
        assertThat(testHeaderKeys.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testHeaderKeys.getValue()).isEqualTo(DEFAULT_VALUE);
        assertThat(testHeaderKeys.getType()).isEqualTo(DEFAULT_TYPE);
    }

    @Test
    @Transactional
    public void createHeaderKeysWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = headerKeysRepository.findAll().size();

        // Create the HeaderKeys with an existing ID
        headerKeys.setId(1L);
        HeaderKeysDTO headerKeysDTO = headerKeysMapper.toDto(headerKeys);

        // An entity with an existing ID cannot be created, so this API call must fail
        restHeaderKeysMockMvc.perform(post("/api/header-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(headerKeysDTO)))
            .andExpect(status().isBadRequest());

        // Validate the HeaderKeys in the database
        List<HeaderKeys> headerKeysList = headerKeysRepository.findAll();
        assertThat(headerKeysList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllHeaderKeys() throws Exception {
        // Initialize the database
        headerKeysRepository.saveAndFlush(headerKeys);

        // Get all the headerKeysList
        restHeaderKeysMockMvc.perform(get("/api/header-keys?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(headerKeys.getId().intValue())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY.toString())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE.toString())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())));
    }
    
    @Test
    @Transactional
    public void getHeaderKeys() throws Exception {
        // Initialize the database
        headerKeysRepository.saveAndFlush(headerKeys);

        // Get the headerKeys
        restHeaderKeysMockMvc.perform(get("/api/header-keys/{id}", headerKeys.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(headerKeys.getId().intValue()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY.toString()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE.toString()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingHeaderKeys() throws Exception {
        // Get the headerKeys
        restHeaderKeysMockMvc.perform(get("/api/header-keys/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateHeaderKeys() throws Exception {
        // Initialize the database
        headerKeysRepository.saveAndFlush(headerKeys);

        int databaseSizeBeforeUpdate = headerKeysRepository.findAll().size();

        // Update the headerKeys
        HeaderKeys updatedHeaderKeys = headerKeysRepository.findById(headerKeys.getId()).get();
        // Disconnect from session so that the updates on updatedHeaderKeys are not directly saved in db
        em.detach(updatedHeaderKeys);
        updatedHeaderKeys
            .key(UPDATED_KEY)
            .value(UPDATED_VALUE)
            .type(UPDATED_TYPE);
        HeaderKeysDTO headerKeysDTO = headerKeysMapper.toDto(updatedHeaderKeys);

        restHeaderKeysMockMvc.perform(put("/api/header-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(headerKeysDTO)))
            .andExpect(status().isOk());

        // Validate the HeaderKeys in the database
        List<HeaderKeys> headerKeysList = headerKeysRepository.findAll();
        assertThat(headerKeysList).hasSize(databaseSizeBeforeUpdate);
        HeaderKeys testHeaderKeys = headerKeysList.get(headerKeysList.size() - 1);
        assertThat(testHeaderKeys.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testHeaderKeys.getValue()).isEqualTo(UPDATED_VALUE);
        assertThat(testHeaderKeys.getType()).isEqualTo(UPDATED_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingHeaderKeys() throws Exception {
        int databaseSizeBeforeUpdate = headerKeysRepository.findAll().size();

        // Create the HeaderKeys
        HeaderKeysDTO headerKeysDTO = headerKeysMapper.toDto(headerKeys);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHeaderKeysMockMvc.perform(put("/api/header-keys")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(headerKeysDTO)))
            .andExpect(status().isBadRequest());

        // Validate the HeaderKeys in the database
        List<HeaderKeys> headerKeysList = headerKeysRepository.findAll();
        assertThat(headerKeysList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteHeaderKeys() throws Exception {
        // Initialize the database
        headerKeysRepository.saveAndFlush(headerKeys);

        int databaseSizeBeforeDelete = headerKeysRepository.findAll().size();

        // Get the headerKeys
        restHeaderKeysMockMvc.perform(delete("/api/header-keys/{id}", headerKeys.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<HeaderKeys> headerKeysList = headerKeysRepository.findAll();
        assertThat(headerKeysList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(HeaderKeys.class);
        HeaderKeys headerKeys1 = new HeaderKeys();
        headerKeys1.setId(1L);
        HeaderKeys headerKeys2 = new HeaderKeys();
        headerKeys2.setId(headerKeys1.getId());
        assertThat(headerKeys1).isEqualTo(headerKeys2);
        headerKeys2.setId(2L);
        assertThat(headerKeys1).isNotEqualTo(headerKeys2);
        headerKeys1.setId(null);
        assertThat(headerKeys1).isNotEqualTo(headerKeys2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(HeaderKeysDTO.class);
        HeaderKeysDTO headerKeysDTO1 = new HeaderKeysDTO();
        headerKeysDTO1.setId(1L);
        HeaderKeysDTO headerKeysDTO2 = new HeaderKeysDTO();
        assertThat(headerKeysDTO1).isNotEqualTo(headerKeysDTO2);
        headerKeysDTO2.setId(headerKeysDTO1.getId());
        assertThat(headerKeysDTO1).isEqualTo(headerKeysDTO2);
        headerKeysDTO2.setId(2L);
        assertThat(headerKeysDTO1).isNotEqualTo(headerKeysDTO2);
        headerKeysDTO1.setId(null);
        assertThat(headerKeysDTO1).isNotEqualTo(headerKeysDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(headerKeysMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(headerKeysMapper.fromId(null)).isNull();
    }
}
