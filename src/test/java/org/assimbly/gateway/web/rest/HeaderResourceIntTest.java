package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.repository.HeaderRepository;
import org.assimbly.gateway.service.dto.HeaderDTO;
import org.assimbly.gateway.service.mapper.HeaderMapper;
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
 * Test class for the HeaderResource REST controller.
 *
 * @see HeaderResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class HeaderResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    @Autowired
    private HeaderRepository headerRepository;

    @Autowired
    private HeaderMapper headerMapper;

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

    private MockMvc restHeaderMockMvc;

    private Header header;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final HeaderResource headerResource = new HeaderResource(headerRepository, headerMapper);
        this.restHeaderMockMvc = MockMvcBuilders.standaloneSetup(headerResource)
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
    public static Header createEntity(EntityManager em) {
        Header header = new Header()
            .name(DEFAULT_NAME);
        return header;
    }

    @Before
    public void initTest() {
        header = createEntity(em);
    }

    @Test
    @Transactional
    public void createHeader() throws Exception {
        int databaseSizeBeforeCreate = headerRepository.findAll().size();

        // Create the Header
        HeaderDTO headerDTO = headerMapper.toDto(header);
        restHeaderMockMvc.perform(post("/api/headers")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(headerDTO)))
            .andExpect(status().isCreated());

        // Validate the Header in the database
        List<Header> headerList = headerRepository.findAll();
        assertThat(headerList).hasSize(databaseSizeBeforeCreate + 1);
        Header testHeader = headerList.get(headerList.size() - 1);
        assertThat(testHeader.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void createHeaderWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = headerRepository.findAll().size();

        // Create the Header with an existing ID
        header.setId(1L);
        HeaderDTO headerDTO = headerMapper.toDto(header);

        // An entity with an existing ID cannot be created, so this API call must fail
        restHeaderMockMvc.perform(post("/api/headers")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(headerDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Header in the database
        List<Header> headerList = headerRepository.findAll();
        assertThat(headerList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllHeaders() throws Exception {
        // Initialize the database
        headerRepository.saveAndFlush(header);

        // Get all the headerList
        restHeaderMockMvc.perform(get("/api/headers?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(header.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }
    
    @Test
    @Transactional
    public void getHeader() throws Exception {
        // Initialize the database
        headerRepository.saveAndFlush(header);

        // Get the header
        restHeaderMockMvc.perform(get("/api/headers/{id}", header.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(header.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingHeader() throws Exception {
        // Get the header
        restHeaderMockMvc.perform(get("/api/headers/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateHeader() throws Exception {
        // Initialize the database
        headerRepository.saveAndFlush(header);

        int databaseSizeBeforeUpdate = headerRepository.findAll().size();

        // Update the header
        Header updatedHeader = headerRepository.findById(header.getId()).get();
        // Disconnect from session so that the updates on updatedHeader are not directly saved in db
        em.detach(updatedHeader);
        updatedHeader
            .name(UPDATED_NAME);
        HeaderDTO headerDTO = headerMapper.toDto(updatedHeader);

        restHeaderMockMvc.perform(put("/api/headers")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(headerDTO)))
            .andExpect(status().isOk());

        // Validate the Header in the database
        List<Header> headerList = headerRepository.findAll();
        assertThat(headerList).hasSize(databaseSizeBeforeUpdate);
        Header testHeader = headerList.get(headerList.size() - 1);
        assertThat(testHeader.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    public void updateNonExistingHeader() throws Exception {
        int databaseSizeBeforeUpdate = headerRepository.findAll().size();

        // Create the Header
        HeaderDTO headerDTO = headerMapper.toDto(header);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHeaderMockMvc.perform(put("/api/headers")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(headerDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Header in the database
        List<Header> headerList = headerRepository.findAll();
        assertThat(headerList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteHeader() throws Exception {
        // Initialize the database
        headerRepository.saveAndFlush(header);

        int databaseSizeBeforeDelete = headerRepository.findAll().size();

        // Get the header
        restHeaderMockMvc.perform(delete("/api/headers/{id}", header.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Header> headerList = headerRepository.findAll();
        assertThat(headerList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Header.class);
        Header header1 = new Header();
        header1.setId(1L);
        Header header2 = new Header();
        header2.setId(header1.getId());
        assertThat(header1).isEqualTo(header2);
        header2.setId(2L);
        assertThat(header1).isNotEqualTo(header2);
        header1.setId(null);
        assertThat(header1).isNotEqualTo(header2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(HeaderDTO.class);
        HeaderDTO headerDTO1 = new HeaderDTO();
        headerDTO1.setId(1L);
        HeaderDTO headerDTO2 = new HeaderDTO();
        assertThat(headerDTO1).isNotEqualTo(headerDTO2);
        headerDTO2.setId(headerDTO1.getId());
        assertThat(headerDTO1).isEqualTo(headerDTO2);
        headerDTO2.setId(2L);
        assertThat(headerDTO1).isNotEqualTo(headerDTO2);
        headerDTO1.setId(null);
        assertThat(headerDTO1).isNotEqualTo(headerDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(headerMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(headerMapper.fromId(null)).isNull();
    }
}
