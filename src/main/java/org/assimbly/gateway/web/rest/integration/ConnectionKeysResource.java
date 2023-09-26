package org.assimbly.gateway.web.rest.integration;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.service.ConnectionKeysService;
import org.assimbly.gateway.service.dto.ConnectionKeysDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.util.EncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing ConnectionKeys.
 */
@RestController
@RequestMapping("/api")
public class ConnectionKeysResource {

    private final Logger log = LoggerFactory.getLogger(ConnectionKeysResource.class);

    private static final String ENTITY_NAME = "connectionKeys";

    private final ConnectionKeysService connectionKeysService;

    @Autowired
    private EncryptionProperties encryptionProperties;

    public ConnectionKeysResource(ConnectionKeysService connectionKeysService) {
        this.connectionKeysService = connectionKeysService;
    }

    /**
     * POST  /connection-keys : Create a new connectionKeys.
     *
     * @param connectionKeysDTO the connectionKeysDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new connectionKeysDTO, or with status 400 (Bad Request) if the connectionKeys has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/connection-keys")
    public ResponseEntity<ConnectionKeysDTO> createConnectionKeys(@RequestBody ConnectionKeysDTO connectionKeysDTO) throws URISyntaxException {
        log.debug("REST request to save ConnectionKeys : {}", connectionKeysDTO);

        if (connectionKeysDTO.getId() != null) {
            throw new BadRequestAlertException("A new connectionKeys cannot already have an ID", ENTITY_NAME, "id already exists");
        }

        if (connectionKeysDTO.getKey().equals("password")) {
            String encryptedValue = encryptValue(connectionKeysDTO.getValue());
            connectionKeysDTO.setValue(encryptedValue);
        }

        connectionKeysDTO = connectionKeysService.save(connectionKeysDTO);

        return ResponseEntity
            .created(new URI("/api/connection-keys/" + connectionKeysDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, connectionKeysDTO.getId().toString()))
            .body(connectionKeysDTO);
    }

    /**
     * PUT  /connection-keys : Updates an existing connectionKeys.
     *
     * @param connectionKeysDTO the connectionKeysDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated connectionKeysDTO,
     * or with status 400 (Bad Request) if the connectionKeysDTO is not valid,
     * or with status 500 (Internal Server Error) if the connectionKeysDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/connection-keys")
    public ResponseEntity<ConnectionKeysDTO> updateConnectionKeys(@RequestBody ConnectionKeysDTO connectionKeysDTO) throws URISyntaxException {
        log.debug("REST request to update ConnectionKeys : {}", connectionKeysDTO);
        if (connectionKeysDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        if (connectionKeysDTO.getKey().equals("password")) {
            String encryptedValue = encryptValue(connectionKeysDTO.getValue());
            connectionKeysDTO.setValue(encryptedValue);
        }

        connectionKeysService.save(connectionKeysDTO);

        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, connectionKeysDTO.getId().toString()))
            .body(connectionKeysDTO);
    }

    /**
     * GET  /connection-keys : get all the connectionKeys.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of connectionKeys in body
     */
    @GetMapping("/connection-keys")
    public List<ConnectionKeysDTO> getAllConnectionKeys() {
        log.debug("REST request to get all ConnectionKeys");
        return connectionKeysService.findAll();
    }

    /**
     * GET  /connection-keys/:id : get the "id" connectionKeys.
     *
     * @param id the id of the connectionKeysDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the connectionKeysDTO, or with status 404 (Not Found)
     */
    @GetMapping("/connection-keys/{id}")
    public ResponseEntity<ConnectionKeysDTO> getConnectionKeys(@PathVariable Long id) {
        log.debug("REST request to get ConnectionKeys : {}", id);
        Optional<ConnectionKeysDTO> connectionKeysDTO = connectionKeysService.findOne(id);
        return ResponseUtil.wrapOrNotFound(connectionKeysDTO);
    }

    /**
     * DELETE  /connection-keys/:id : delete the "id" connectionKeys.
     *
     * @param id the id of the connectionKeysDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/connection-keys/{id}")
    public ResponseEntity<Void> deleteConnectionKeys(@PathVariable Long id) {
        log.debug("REST request to delete ConnectionKeys : {}", id);
        connectionKeysService.delete(id);
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
