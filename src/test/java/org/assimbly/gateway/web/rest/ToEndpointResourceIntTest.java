package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.repository.ToEndpointRepository;
import org.assimbly.gateway.service.dto.ToEndpointDTO;
import org.assimbly.gateway.service.mapper.ToEndpointMapper;
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

import org.assimbly.gateway.domain.enumeration.EndpointType;
/**
 * Test class for the ToEndpointResource REST controller.
 *
 * @see ToEndpointResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class ToEndpointResourceIntTest {

    private static final EndpointType DEFAULT_TYPE = EndpointType.SONICMQ;
    private static final EndpointType UPDATED_TYPE = EndpointType.ACTIVEMQ;

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final String DEFAULT_OPTIONS = "AAAAAAAAAA";
    private static final String UPDATED_OPTIONS = "BBBBBBBBBB";

    @Autowired
    private ToEndpointRepository toEndpointRepository;

    @Autowired
    private ToEndpointMapper toEndpointMapper;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restToEndpointMockMvc;

    private ToEndpoint toEndpoint;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ToEndpointResource toEndpointResource = new ToEndpointResource(toEndpointRepository, toEndpointMapper);
        this.restToEndpointMockMvc = MockMvcBuilders.standaloneSetup(toEndpointResource)
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
    public static ToEndpoint createEntity(EntityManager em) {
        ToEndpoint toEndpoint = new ToEndpoint()
            .type(DEFAULT_TYPE)
            .uri(DEFAULT_URI)
            .options(DEFAULT_OPTIONS);
        return toEndpoint;
    }

    @Before
    public void initTest() {
        toEndpoint = createEntity(em);
    }

    @Test
    @Transactional
    public void createToEndpoint() throws Exception {
        int databaseSizeBeforeCreate = toEndpointRepository.findAll().size();

        // Create the ToEndpoint
        ToEndpointDTO toEndpointDTO = toEndpointMapper.toDto(toEndpoint);
        restToEndpointMockMvc.perform(post("/api/to-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(toEndpointDTO)))
            .andExpect(status().isCreated());

        // Validate the ToEndpoint in the database
        List<ToEndpoint> toEndpointList = toEndpointRepository.findAll();
        assertThat(toEndpointList).hasSize(databaseSizeBeforeCreate + 1);
        ToEndpoint testToEndpoint = toEndpointList.get(toEndpointList.size() - 1);
        assertThat(testToEndpoint.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testToEndpoint.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testToEndpoint.getOptions()).isEqualTo(DEFAULT_OPTIONS);
    }

    @Test
    @Transactional
    public void createToEndpointWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = toEndpointRepository.findAll().size();

        // Create the ToEndpoint with an existing ID
        toEndpoint.setId(1L);
        ToEndpointDTO toEndpointDTO = toEndpointMapper.toDto(toEndpoint);

        // An entity with an existing ID cannot be created, so this API call must fail
        restToEndpointMockMvc.perform(post("/api/to-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(toEndpointDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ToEndpoint in the database
        List<ToEndpoint> toEndpointList = toEndpointRepository.findAll();
        assertThat(toEndpointList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllToEndpoints() throws Exception {
        // Initialize the database
        toEndpointRepository.saveAndFlush(toEndpoint);

        // Get all the toEndpointList
        restToEndpointMockMvc.perform(get("/api/to-endpoints?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(toEndpoint.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI.toString())))
            .andExpect(jsonPath("$.[*].options").value(hasItem(DEFAULT_OPTIONS.toString())));
    }

    @Test
    @Transactional
    public void getToEndpoint() throws Exception {
        // Initialize the database
        toEndpointRepository.saveAndFlush(toEndpoint);

        // Get the toEndpoint
        restToEndpointMockMvc.perform(get("/api/to-endpoints/{id}", toEndpoint.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(toEndpoint.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI.toString()))
            .andExpect(jsonPath("$.options").value(DEFAULT_OPTIONS.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingToEndpoint() throws Exception {
        // Get the toEndpoint
        restToEndpointMockMvc.perform(get("/api/to-endpoints/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateToEndpoint() throws Exception {
        // Initialize the database
        toEndpointRepository.saveAndFlush(toEndpoint);
        int databaseSizeBeforeUpdate = toEndpointRepository.findAll().size();

        // Update the toEndpoint
        ToEndpoint updatedToEndpoint = toEndpointRepository.findOne(toEndpoint.getId());
        // Disconnect from session so that the updates on updatedToEndpoint are not directly saved in db
        em.detach(updatedToEndpoint);
        updatedToEndpoint
            .type(UPDATED_TYPE)
            .uri(UPDATED_URI)
            .options(UPDATED_OPTIONS);
        ToEndpointDTO toEndpointDTO = toEndpointMapper.toDto(updatedToEndpoint);

        restToEndpointMockMvc.perform(put("/api/to-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(toEndpointDTO)))
            .andExpect(status().isOk());

        // Validate the ToEndpoint in the database
        List<ToEndpoint> toEndpointList = toEndpointRepository.findAll();
        assertThat(toEndpointList).hasSize(databaseSizeBeforeUpdate);
        ToEndpoint testToEndpoint = toEndpointList.get(toEndpointList.size() - 1);
        assertThat(testToEndpoint.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testToEndpoint.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testToEndpoint.getOptions()).isEqualTo(UPDATED_OPTIONS);
    }

    @Test
    @Transactional
    public void updateNonExistingToEndpoint() throws Exception {
        int databaseSizeBeforeUpdate = toEndpointRepository.findAll().size();

        // Create the ToEndpoint
        ToEndpointDTO toEndpointDTO = toEndpointMapper.toDto(toEndpoint);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restToEndpointMockMvc.perform(put("/api/to-endpoints")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(toEndpointDTO)))
            .andExpect(status().isCreated());

        // Validate the ToEndpoint in the database
        List<ToEndpoint> toEndpointList = toEndpointRepository.findAll();
        assertThat(toEndpointList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteToEndpoint() throws Exception {
        // Initialize the database
        toEndpointRepository.saveAndFlush(toEndpoint);
        int databaseSizeBeforeDelete = toEndpointRepository.findAll().size();

        // Get the toEndpoint
        restToEndpointMockMvc.perform(delete("/api/to-endpoints/{id}", toEndpoint.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ToEndpoint> toEndpointList = toEndpointRepository.findAll();
        assertThat(toEndpointList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ToEndpoint.class);
        ToEndpoint toEndpoint1 = new ToEndpoint();
        toEndpoint1.setId(1L);
        ToEndpoint toEndpoint2 = new ToEndpoint();
        toEndpoint2.setId(toEndpoint1.getId());
        assertThat(toEndpoint1).isEqualTo(toEndpoint2);
        toEndpoint2.setId(2L);
        assertThat(toEndpoint1).isNotEqualTo(toEndpoint2);
        toEndpoint1.setId(null);
        assertThat(toEndpoint1).isNotEqualTo(toEndpoint2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ToEndpointDTO.class);
        ToEndpointDTO toEndpointDTO1 = new ToEndpointDTO();
        toEndpointDTO1.setId(1L);
        ToEndpointDTO toEndpointDTO2 = new ToEndpointDTO();
        assertThat(toEndpointDTO1).isNotEqualTo(toEndpointDTO2);
        toEndpointDTO2.setId(toEndpointDTO1.getId());
        assertThat(toEndpointDTO1).isEqualTo(toEndpointDTO2);
        toEndpointDTO2.setId(2L);
        assertThat(toEndpointDTO1).isNotEqualTo(toEndpointDTO2);
        toEndpointDTO1.setId(null);
        assertThat(toEndpointDTO1).isNotEqualTo(toEndpointDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(toEndpointMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(toEndpointMapper.fromId(null)).isNull();
    }
}
