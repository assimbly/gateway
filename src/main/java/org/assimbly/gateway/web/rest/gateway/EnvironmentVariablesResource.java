package org.assimbly.gateway.web.rest.gateway;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.service.EnvironmentVariablesService;
import org.assimbly.gateway.service.dto.EnvironmentVariablesDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.util.EncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing EnvironmentVariables.
 */
@RestController
@RequestMapping("/api")
public class EnvironmentVariablesResource {

    private final Logger log = LoggerFactory.getLogger(EnvironmentVariablesResource.class);

    private static final String ENTITY_NAME = "environmentVariables";

    private final EnvironmentVariablesService environmentVariablesService;

    @Autowired
    private EncryptionProperties encryptionProperties;

    public EnvironmentVariablesResource(EnvironmentVariablesService environmentVariablesService) {
        this.environmentVariablesService = environmentVariablesService;
    }

    /**
     * POST  /environment-variables : Create a new environmentVariables.
     *
     * @param environmentVariablesDTO the environmentVariablesDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new environmentVariablesDTO, or with status 400 (Bad Request) if the environmentVariables has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/environment-variables")
    public ResponseEntity<EnvironmentVariablesDTO> createEnvironmentVariables(@RequestBody EnvironmentVariablesDTO environmentVariablesDTO)
        throws URISyntaxException {
        log.debug("REST request to save EnvironmentVariables : {}", environmentVariablesDTO);
        if (environmentVariablesDTO.getId() != null) {
            throw new BadRequestAlertException("A new environmentVariables cannot already have an ID", ENTITY_NAME, "idexists");
        }

        if (environmentVariablesDTO.isEncrypted()) {
            String encryptedValue = encryptValue(environmentVariablesDTO.getValue());
            environmentVariablesDTO.setValue(encryptedValue);
        }

        EnvironmentVariablesDTO result = environmentVariablesService.save(environmentVariablesDTO);
        return ResponseEntity
            .created(new URI("/api/environment-variables/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /environment-variables : Updates an existing environmentVariables.
     *
     * @param environmentVariablesDTO the environmentVariablesDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated environmentVariablesDTO,
     * or with status 400 (Bad Request) if the environmentVariablesDTO is not valid,
     * or with status 500 (Internal Server Error) if the environmentVariablesDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/environment-variables")
    public ResponseEntity<EnvironmentVariablesDTO> updateEnvironmentVariables(@RequestBody EnvironmentVariablesDTO environmentVariablesDTO)
        throws URISyntaxException {
        log.debug("REST request to update EnvironmentVariables : {}", environmentVariablesDTO);
        if (environmentVariablesDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        if (environmentVariablesDTO.isEncrypted()) {
            String encryptedValue = encryptValue(environmentVariablesDTO.getValue());
            environmentVariablesDTO.setValue(encryptedValue);
        }

        EnvironmentVariablesDTO result = environmentVariablesService.save(environmentVariablesDTO);

        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
            .body(environmentVariablesDTO);
    }

    /**
     * GET  /environment-variables : get all the environmentVariables.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of environmentVariables in body
     */
    @GetMapping("/environment-variables")
    public ResponseEntity<List<EnvironmentVariablesDTO>> getAllEnvironmentVariables(Pageable pageable) {
        log.debug("REST request to get all EnvironmentVariables");
        Page<EnvironmentVariablesDTO> page = environmentVariablesService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/environment-variables");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /environment-variables/:id : get the "id" environmentVariables.
     *
     * @param id the id of the environmentVariablesDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the environmentVariablesDTO, or with status 404 (Not Found)
     */
    @GetMapping("/environment-variables/{id}")
    public ResponseEntity<EnvironmentVariablesDTO> getEnvironmentVariables(@PathVariable Long id) {
        log.debug("REST request to get EnvironmentVariables : {}", id);
        Optional<EnvironmentVariablesDTO> environmentVariablesDTO = environmentVariablesService.findOne(id);
        return ResponseUtil.wrapOrNotFound(environmentVariablesDTO);
    }

    /**
     * DELETE  /environment-variables/:id : delete the "id" environmentVariables.
     *
     * @param id the id of the environmentVariablesDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/environment-variables/{id}")
    public ResponseEntity<Void> deleteEnvironmentVariables(@PathVariable Long id) {
        log.debug("REST request to delete EnvironmentVariables : {}", id);
        environmentVariablesService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    private String encryptValue(String value) {
        Properties properties = encryptionProperties.getProperties();
        String password = properties.getProperty("password");
        String algorithm = properties.getProperty("algorithm");

        EncryptionUtil encryptionUtil = new EncryptionUtil(password, algorithm);

        String encryptedValue = encryptionUtil.encrypt(value);

        return encryptedValue;
    }
}
