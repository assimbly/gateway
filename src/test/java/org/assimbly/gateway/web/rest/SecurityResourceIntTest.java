package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.Security;
import org.assimbly.gateway.repository.SecurityRepository;
import org.assimbly.gateway.service.SecurityService;
import org.assimbly.gateway.service.dto.SecurityDTO;
import org.assimbly.gateway.service.mapper.SecurityTLSMapper;
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
 * Test class for the SecurityResource REST controller.
 *
 * @see SecurityResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class SecurityResourceIntTest {

    private static final String DEFAULT_URL = "AAAAAAAAAA";
    private static final String UPDATED_URL = "BBBBBBBBBB";

    private static final String DEFAULT_CERTIFICATE_NAME = "AAAAAAAAAA";
    private static final String UPDATED_CERTIFICATE_NAME = "BBBBBBBBBB";

    private static final Instant DEFAULT_CERTIFICATE_EXPIRY = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CERTIFICATE_EXPIRY = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    @Autowired
    private SecurityRepository securityRepository;

    @Autowired
    private SecurityTLSMapper securityMapper;

    @Autowired
    private SecurityService securityService;

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

    private MockMvc restSecurityMockMvc;

    private Security security;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final SecurityResource securityResource = new SecurityResource(securityService);
        this.restSecurityMockMvc = MockMvcBuilders.standaloneSetup(securityResource)
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
    public static Security createEntity(EntityManager em) {
        Security security = new Security()
            .url(DEFAULT_URL)
            .certificateName(DEFAULT_CERTIFICATE_NAME)
            .certificateExpiry(DEFAULT_CERTIFICATE_EXPIRY);
        return security;
    }

    @Before
    public void initTest() {
        security = createEntity(em);
    }

    @Test
    @Transactional
    public void createSecurity() throws Exception {
        int databaseSizeBeforeCreate = securityRepository.findAll().size();

        // Create the Security
        SecurityDTO securityDTO = securityMapper.toDto(security);
        restSecurityMockMvc.perform(post("/api/securities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(securityDTO)))
            .andExpect(status().isCreated());

        // Validate the Security in the database
        List<Security> securityList = securityRepository.findAll();
        assertThat(securityList).hasSize(databaseSizeBeforeCreate + 1);
        Security testSecurity = securityList.get(securityList.size() - 1);
        assertThat(testSecurity.getUrl()).isEqualTo(DEFAULT_URL);
        assertThat(testSecurity.getCertificateName()).isEqualTo(DEFAULT_CERTIFICATE_NAME);
        assertThat(testSecurity.getCertificateExpiry()).isEqualTo(DEFAULT_CERTIFICATE_EXPIRY);
    }

    @Test
    @Transactional
    public void createSecurityWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = securityRepository.findAll().size();

        // Create the Security with an existing ID
        security.setId(1L);
        SecurityDTO securityDTO = securityMapper.toDto(security);

        // An entity with an existing ID cannot be created, so this API call must fail
        restSecurityMockMvc.perform(post("/api/securities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(securityDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Security in the database
        List<Security> securityList = securityRepository.findAll();
        assertThat(securityList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllSecurities() throws Exception {
        // Initialize the database
        securityRepository.saveAndFlush(security);

        // Get all the securityList
        restSecurityMockMvc.perform(get("/api/securities?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(security.getId().intValue())))
            .andExpect(jsonPath("$.[*].url").value(hasItem(DEFAULT_URL.toString())))
            .andExpect(jsonPath("$.[*].certificateName").value(hasItem(DEFAULT_CERTIFICATE_NAME.toString())))
            .andExpect(jsonPath("$.[*].certificateExpiry").value(hasItem(DEFAULT_CERTIFICATE_EXPIRY.toString())));
    }
    
    @Test
    @Transactional
    public void getSecurity() throws Exception {
        // Initialize the database
        securityRepository.saveAndFlush(security);

        // Get the security
        restSecurityMockMvc.perform(get("/api/securities/{id}", security.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(security.getId().intValue()))
            .andExpect(jsonPath("$.url").value(DEFAULT_URL.toString()))
            .andExpect(jsonPath("$.certificateName").value(DEFAULT_CERTIFICATE_NAME.toString()))
            .andExpect(jsonPath("$.certificateExpiry").value(DEFAULT_CERTIFICATE_EXPIRY.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingSecurity() throws Exception {
        // Get the security
        restSecurityMockMvc.perform(get("/api/securities/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateSecurity() throws Exception {
        // Initialize the database
        securityRepository.saveAndFlush(security);

        int databaseSizeBeforeUpdate = securityRepository.findAll().size();

        // Update the security
        Security updatedSecurity = securityRepository.findById(security.getId()).get();
        // Disconnect from session so that the updates on updatedSecurity are not directly saved in db
        em.detach(updatedSecurity);
        updatedSecurity
            .url(UPDATED_URL)
            .certificateName(UPDATED_CERTIFICATE_NAME)
            .certificateExpiry(UPDATED_CERTIFICATE_EXPIRY);
        SecurityDTO securityDTO = securityMapper.toDto(updatedSecurity);

        restSecurityMockMvc.perform(put("/api/securities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(securityDTO)))
            .andExpect(status().isOk());

        // Validate the Security in the database
        List<Security> securityList = securityRepository.findAll();
        assertThat(securityList).hasSize(databaseSizeBeforeUpdate);
        Security testSecurity = securityList.get(securityList.size() - 1);
        assertThat(testSecurity.getUrl()).isEqualTo(UPDATED_URL);
        assertThat(testSecurity.getCertificateName()).isEqualTo(UPDATED_CERTIFICATE_NAME);
        assertThat(testSecurity.getCertificateExpiry()).isEqualTo(UPDATED_CERTIFICATE_EXPIRY);
    }

    @Test
    @Transactional
    public void updateNonExistingSecurity() throws Exception {
        int databaseSizeBeforeUpdate = securityRepository.findAll().size();

        // Create the Security
        SecurityDTO securityDTO = securityMapper.toDto(security);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSecurityMockMvc.perform(put("/api/securities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(securityDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Security in the database
        List<Security> securityList = securityRepository.findAll();
        assertThat(securityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteSecurity() throws Exception {
        // Initialize the database
        securityRepository.saveAndFlush(security);

        int databaseSizeBeforeDelete = securityRepository.findAll().size();

        // Get the security
        restSecurityMockMvc.perform(delete("/api/securities/{id}", security.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Security> securityList = securityRepository.findAll();
        assertThat(securityList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Security.class);
        Security security1 = new Security();
        security1.setId(1L);
        Security security2 = new Security();
        security2.setId(security1.getId());
        assertThat(security1).isEqualTo(security2);
        security2.setId(2L);
        assertThat(security1).isNotEqualTo(security2);
        security1.setId(null);
        assertThat(security1).isNotEqualTo(security2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(SecurityDTO.class);
        SecurityDTO securityDTO1 = new SecurityDTO();
        securityDTO1.setId(1L);
        SecurityDTO securityDTO2 = new SecurityDTO();
        assertThat(securityDTO1).isNotEqualTo(securityDTO2);
        securityDTO2.setId(securityDTO1.getId());
        assertThat(securityDTO1).isEqualTo(securityDTO2);
        securityDTO2.setId(2L);
        assertThat(securityDTO1).isNotEqualTo(securityDTO2);
        securityDTO1.setId(null);
        assertThat(securityDTO1).isNotEqualTo(securityDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(securityMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(securityMapper.fromId(null)).isNull();
    }
}
