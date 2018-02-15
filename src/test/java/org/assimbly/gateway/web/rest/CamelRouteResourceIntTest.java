package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.CamelRoute;
import org.assimbly.gateway.repository.CamelRouteRepository;
import org.assimbly.gateway.service.dto.CamelRouteDTO;
import org.assimbly.gateway.service.mapper.CamelRouteMapper;
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
 * Test class for the CamelRouteResource REST controller.
 *
 * @see CamelRouteResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class CamelRouteResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    @Autowired
    private CamelRouteRepository camelRouteRepository;

    @Autowired
    private CamelRouteMapper camelRouteMapper;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restCamelRouteMockMvc;

    private CamelRoute camelRoute;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final CamelRouteResource camelRouteResource = new CamelRouteResource(camelRouteRepository, camelRouteMapper);
        this.restCamelRouteMockMvc = MockMvcBuilders.standaloneSetup(camelRouteResource)
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
    public static CamelRoute createEntity(EntityManager em) {
        CamelRoute camelRoute = new CamelRoute()
            .name(DEFAULT_NAME);
        return camelRoute;
    }

    @Before
    public void initTest() {
        camelRoute = createEntity(em);
    }

    @Test
    @Transactional
    public void createCamelRoute() throws Exception {
        int databaseSizeBeforeCreate = camelRouteRepository.findAll().size();

        // Create the CamelRoute
        CamelRouteDTO camelRouteDTO = camelRouteMapper.toDto(camelRoute);
        restCamelRouteMockMvc.perform(post("/api/camel-routes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(camelRouteDTO)))
            .andExpect(status().isCreated());

        // Validate the CamelRoute in the database
        List<CamelRoute> camelRouteList = camelRouteRepository.findAll();
        assertThat(camelRouteList).hasSize(databaseSizeBeforeCreate + 1);
        CamelRoute testCamelRoute = camelRouteList.get(camelRouteList.size() - 1);
        assertThat(testCamelRoute.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void createCamelRouteWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = camelRouteRepository.findAll().size();

        // Create the CamelRoute with an existing ID
        camelRoute.setId(1L);
        CamelRouteDTO camelRouteDTO = camelRouteMapper.toDto(camelRoute);

        // An entity with an existing ID cannot be created, so this API call must fail
        restCamelRouteMockMvc.perform(post("/api/camel-routes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(camelRouteDTO)))
            .andExpect(status().isBadRequest());

        // Validate the CamelRoute in the database
        List<CamelRoute> camelRouteList = camelRouteRepository.findAll();
        assertThat(camelRouteList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllCamelRoutes() throws Exception {
        // Initialize the database
        camelRouteRepository.saveAndFlush(camelRoute);

        // Get all the camelRouteList
        restCamelRouteMockMvc.perform(get("/api/camel-routes?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(camelRoute.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }

    @Test
    @Transactional
    public void getCamelRoute() throws Exception {
        // Initialize the database
        camelRouteRepository.saveAndFlush(camelRoute);

        // Get the camelRoute
        restCamelRouteMockMvc.perform(get("/api/camel-routes/{id}", camelRoute.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(camelRoute.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingCamelRoute() throws Exception {
        // Get the camelRoute
        restCamelRouteMockMvc.perform(get("/api/camel-routes/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateCamelRoute() throws Exception {
        // Initialize the database
        camelRouteRepository.saveAndFlush(camelRoute);
        int databaseSizeBeforeUpdate = camelRouteRepository.findAll().size();

        // Update the camelRoute
        CamelRoute updatedCamelRoute = camelRouteRepository.findOne(camelRoute.getId());
        // Disconnect from session so that the updates on updatedCamelRoute are not directly saved in db
        em.detach(updatedCamelRoute);
        updatedCamelRoute
            .name(UPDATED_NAME);
        CamelRouteDTO camelRouteDTO = camelRouteMapper.toDto(updatedCamelRoute);

        restCamelRouteMockMvc.perform(put("/api/camel-routes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(camelRouteDTO)))
            .andExpect(status().isOk());

        // Validate the CamelRoute in the database
        List<CamelRoute> camelRouteList = camelRouteRepository.findAll();
        assertThat(camelRouteList).hasSize(databaseSizeBeforeUpdate);
        CamelRoute testCamelRoute = camelRouteList.get(camelRouteList.size() - 1);
        assertThat(testCamelRoute.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    public void updateNonExistingCamelRoute() throws Exception {
        int databaseSizeBeforeUpdate = camelRouteRepository.findAll().size();

        // Create the CamelRoute
        CamelRouteDTO camelRouteDTO = camelRouteMapper.toDto(camelRoute);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restCamelRouteMockMvc.perform(put("/api/camel-routes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(camelRouteDTO)))
            .andExpect(status().isCreated());

        // Validate the CamelRoute in the database
        List<CamelRoute> camelRouteList = camelRouteRepository.findAll();
        assertThat(camelRouteList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteCamelRoute() throws Exception {
        // Initialize the database
        camelRouteRepository.saveAndFlush(camelRoute);
        int databaseSizeBeforeDelete = camelRouteRepository.findAll().size();

        // Get the camelRoute
        restCamelRouteMockMvc.perform(delete("/api/camel-routes/{id}", camelRoute.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<CamelRoute> camelRouteList = camelRouteRepository.findAll();
        assertThat(camelRouteList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CamelRoute.class);
        CamelRoute camelRoute1 = new CamelRoute();
        camelRoute1.setId(1L);
        CamelRoute camelRoute2 = new CamelRoute();
        camelRoute2.setId(camelRoute1.getId());
        assertThat(camelRoute1).isEqualTo(camelRoute2);
        camelRoute2.setId(2L);
        assertThat(camelRoute1).isNotEqualTo(camelRoute2);
        camelRoute1.setId(null);
        assertThat(camelRoute1).isNotEqualTo(camelRoute2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CamelRouteDTO.class);
        CamelRouteDTO camelRouteDTO1 = new CamelRouteDTO();
        camelRouteDTO1.setId(1L);
        CamelRouteDTO camelRouteDTO2 = new CamelRouteDTO();
        assertThat(camelRouteDTO1).isNotEqualTo(camelRouteDTO2);
        camelRouteDTO2.setId(camelRouteDTO1.getId());
        assertThat(camelRouteDTO1).isEqualTo(camelRouteDTO2);
        camelRouteDTO2.setId(2L);
        assertThat(camelRouteDTO1).isNotEqualTo(camelRouteDTO2);
        camelRouteDTO1.setId(null);
        assertThat(camelRouteDTO1).isNotEqualTo(camelRouteDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(camelRouteMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(camelRouteMapper.fromId(null)).isNull();
    }
}
