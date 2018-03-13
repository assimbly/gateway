package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.service.mapper.FlowMapper;
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
 * Test class for the FlowResource REST controller.
 *
 * @see FlowResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class FlowResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private FlowMapper flowMapper;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restFlowMockMvc;

    private Flow flow;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final FlowResource flowResource = new FlowResource(flowRepository, null, null, null, flowMapper);
        this.restFlowMockMvc = MockMvcBuilders.standaloneSetup(flowResource)
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
    public static Flow createEntity(EntityManager em) {
        Flow flow = new Flow()
            .name(DEFAULT_NAME);
        return flow;
    }

    @Before
    public void initTest() {
        flow = createEntity(em);
    }

    @Test
    @Transactional
    public void createFlow() throws Exception {
        int databaseSizeBeforeCreate = flowRepository.findAll().size();

        // Create the Flow
        FlowDTO flowDTO = flowMapper.toDto(flow);
        restFlowMockMvc.perform(post("/api/flows")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(flowDTO)))
            .andExpect(status().isCreated());

        // Validate the Flow in the database
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeCreate + 1);
        Flow testFlow = flowList.get(flowList.size() - 1);
        assertThat(testFlow.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void createFlowWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = flowRepository.findAll().size();

        // Create the Flow with an existing ID
        flow.setId(1L);
        FlowDTO flowDTO = flowMapper.toDto(flow);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFlowMockMvc.perform(post("/api/flows")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(flowDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Flow in the database
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllFlows() throws Exception {
        // Initialize the database
        flowRepository.saveAndFlush(flow);

        // Get all the flowList
        restFlowMockMvc.perform(get("/api/flows?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(flow.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }

    @Test
    @Transactional
    public void getFlow() throws Exception {
        // Initialize the database
        flowRepository.saveAndFlush(flow);

        // Get the flow
        restFlowMockMvc.perform(get("/api/flows/{id}", flow.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(flow.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingFlow() throws Exception {
        // Get the flow
        restFlowMockMvc.perform(get("/api/flows/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFlow() throws Exception {
        // Initialize the database
        flowRepository.saveAndFlush(flow);
        int databaseSizeBeforeUpdate = flowRepository.findAll().size();

        // Update the flow
        Flow updatedFlow = flowRepository.findOne(flow.getId());
        // Disconnect from session so that the updates on updatedFlow are not directly saved in db
        em.detach(updatedFlow);
        updatedFlow
            .name(UPDATED_NAME);
        FlowDTO flowDTO = flowMapper.toDto(updatedFlow);

        restFlowMockMvc.perform(put("/api/flows")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(flowDTO)))
            .andExpect(status().isOk());

        // Validate the Flow in the database
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeUpdate);
        Flow testFlow = flowList.get(flowList.size() - 1);
        assertThat(testFlow.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    public void updateNonExistingFlow() throws Exception {
        int databaseSizeBeforeUpdate = flowRepository.findAll().size();

        // Create the Flow
        FlowDTO flowDTO = flowMapper.toDto(flow);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restFlowMockMvc.perform(put("/api/flows")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(flowDTO)))
            .andExpect(status().isCreated());

        // Validate the Flow in the database
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteFlow() throws Exception {
        // Initialize the database
        flowRepository.saveAndFlush(flow);
        int databaseSizeBeforeDelete = flowRepository.findAll().size();

        // Get the flow
        restFlowMockMvc.perform(delete("/api/flows/{id}", flow.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Flow.class);
        Flow flow1 = new Flow();
        flow1.setId(1L);
        Flow flow2 = new Flow();
        flow2.setId(flow1.getId());
        assertThat(flow1).isEqualTo(flow2);
        flow2.setId(2L);
        assertThat(flow1).isNotEqualTo(flow2);
        flow1.setId(null);
        assertThat(flow1).isNotEqualTo(flow2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(FlowDTO.class);
        FlowDTO flowDTO1 = new FlowDTO();
        flowDTO1.setId(1L);
        FlowDTO flowDTO2 = new FlowDTO();
        assertThat(flowDTO1).isNotEqualTo(flowDTO2);
        flowDTO2.setId(flowDTO1.getId());
        assertThat(flowDTO1).isEqualTo(flowDTO2);
        flowDTO2.setId(2L);
        assertThat(flowDTO1).isNotEqualTo(flowDTO2);
        flowDTO1.setId(null);
        assertThat(flowDTO1).isNotEqualTo(flowDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(flowMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(flowMapper.fromId(null)).isNull();
    }
}
