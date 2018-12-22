package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.WireTapEndpoint;
import org.assimbly.gateway.repository.WireTapEndpointRepository;
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

import org.assimbly.gateway.domain.enumeration.EndpointType;
/**
 * Test class for the WireTapEndpointResource REST controller.
 *
 * @see WireTapEndpointResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class WireTapEndpointResourceIntTest {

    private static final EndpointType DEFAULT_TYPE = EndpointType.SONICMQ;
    private static final EndpointType UPDATED_TYPE = EndpointType.ACTIVEMQ;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    @Autowired
    private WireTapEndpointRepository wireTapEndpointRepository;

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

    private MockMvc restWireTapEndpointMockMvc;

    private WireTapEndpoint wireTapEndpoint;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final WireTapEndpointResource wireTapEndpointResource = new WireTapEndpointResource(wireTapEndpointRepository);
        this.restWireTapEndpointMockMvc = MockMvcBuilders.standaloneSetup(wireTapEndpointResource)
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
    public static WireTapEndpoint createEntity(EntityManager em) {
        WireTapEndpoint wireTapEndpoint = new WireTapEndpoint()
            .type(DEFAULT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS);
        return wireTapEndpoint;
    }

    @Before
    public void initTest() {
        wireTapEndpoint = createEntity(em);
    }

    @Test
    @Transactional
    public void createWireTapEndpoint() throws Exception {
        int databaseSizeBeforeCreate = wireTapEndpointRepository.findAll().size();

        // Create the WireTapEndpoint
        restWireTapEndpointMockMvc.perform(post("/api/wire-tap-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(wireTapEndpoint)))
            .andExpect(status().isCreated());

        // Validate the WireTapEndpoint in the database
        List<WireTapEndpoint> wireTapEndpointList = wireTapEndpointRepository.findAll();
        assertThat(wireTapEndpointList).hasSize(databaseSizeBeforeCreate + 1);
        WireTapEndpoint testWireTapEndpoint = wireTapEndpointList.get(wireTapEndpointList.size() - 1);
        assertThat(testWireTapEndpoint.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testWireTapEndpoint.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testWireTapEndpoint.getOptions()).isEqualTo(DEFAULT_OPTIONS);
    }

    @Test
    @Transactional
    public void createWireTapEndpointWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = wireTapEndpointRepository.findAll().size();

        // Create the WireTapEndpoint with an existing ID
        wireTapEndpoint.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restWireTapEndpointMockMvc.perform(post("/api/wire-tap-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(wireTapEndpoint)))
            .andExpect(status().isBadRequest());

        // Validate the WireTapEndpoint in the database
        List<WireTapEndpoint> wireTapEndpointList = wireTapEndpointRepository.findAll();
        assertThat(wireTapEndpointList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllWireTapEndpoints() throws Exception {
        // Initialize the database
        wireTapEndpointRepository.saveAndFlush(wireTapEndpoint);

        // Get all the wireTapEndpointList
        restWireTapEndpointMockMvc.perform(get("/api/wire-tap-endpoints?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(wireTapEndpoint.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI.toString())))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS.toString())));
    }
    
    @Test
    @Transactional
    public void getWireTapEndpoint() throws Exception {
        // Initialize the database
        wireTapEndpointRepository.saveAndFlush(wireTapEndpoint);

        // Get the wireTapEndpoint
        restWireTapEndpointMockMvc.perform(get("/api/wire-tap-endpoints/{id}", wireTapEndpoint.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(wireTapEndpoint.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI.toString()))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingWireTapEndpoint() throws Exception {
        // Get the wireTapEndpoint
        restWireTapEndpointMockMvc.perform(get("/api/wire-tap-endpoints/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateWireTapEndpoint() throws Exception {
        // Initialize the database
        wireTapEndpointRepository.saveAndFlush(wireTapEndpoint);

        int databaseSizeBeforeUpdate = wireTapEndpointRepository.findAll().size();

        // Update the wireTapEndpoint
        WireTapEndpoint updatedWireTapEndpoint = wireTapEndpointRepository.findById(wireTapEndpoint.getId()).get();
        // Disconnect from session so that the updates on updatedWireTapEndpoint are not directly saved in db
        em.detach(updatedWireTapEndpoint);
        updatedWireTapEndpoint
            .type(UPDATED_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS);

        restWireTapEndpointMockMvc.perform(put("/api/wire-tap-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedWireTapEndpoint)))
            .andExpect(status().isOk());

        // Validate the WireTapEndpoint in the database
        List<WireTapEndpoint> wireTapEndpointList = wireTapEndpointRepository.findAll();
        assertThat(wireTapEndpointList).hasSize(databaseSizeBeforeUpdate);
        WireTapEndpoint testWireTapEndpoint = wireTapEndpointList.get(wireTapEndpointList.size() - 1);
        assertThat(testWireTapEndpoint.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testWireTapEndpoint.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testWireTapEndpoint.getOptions()).isEqualTo(UPDATED_OPTIONS);
    }

    @Test
    @Transactional
    public void updateNonExistingWireTapEndpoint() throws Exception {
        int databaseSizeBeforeUpdate = wireTapEndpointRepository.findAll().size();

        // Create the WireTapEndpoint

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restWireTapEndpointMockMvc.perform(put("/api/wire-tap-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(wireTapEndpoint)))
            .andExpect(status().isBadRequest());

        // Validate the WireTapEndpoint in the database
        List<WireTapEndpoint> wireTapEndpointList = wireTapEndpointRepository.findAll();
        assertThat(wireTapEndpointList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteWireTapEndpoint() throws Exception {
        // Initialize the database
        wireTapEndpointRepository.saveAndFlush(wireTapEndpoint);

        int databaseSizeBeforeDelete = wireTapEndpointRepository.findAll().size();

        // Get the wireTapEndpoint
        restWireTapEndpointMockMvc.perform(delete("/api/wire-tap-endpoints/{id}", wireTapEndpoint.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<WireTapEndpoint> wireTapEndpointList = wireTapEndpointRepository.findAll();
        assertThat(wireTapEndpointList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(WireTapEndpoint.class);
        WireTapEndpoint wireTapEndpoint1 = new WireTapEndpoint();
        wireTapEndpoint1.setId(1L);
        WireTapEndpoint wireTapEndpoint2 = new WireTapEndpoint();
        wireTapEndpoint2.setId(wireTapEndpoint1.getId());
        assertThat(wireTapEndpoint1).isEqualTo(wireTapEndpoint2);
        wireTapEndpoint2.setId(2L);
        assertThat(wireTapEndpoint1).isNotEqualTo(wireTapEndpoint2);
        wireTapEndpoint1.setId(null);
        assertThat(wireTapEndpoint1).isNotEqualTo(wireTapEndpoint2);
    }
}
