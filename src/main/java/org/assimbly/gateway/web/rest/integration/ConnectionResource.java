package org.assimbly.gateway.web.rest.integration;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import org.assimbly.gateway.domain.Connection;
import org.assimbly.gateway.domain.ConnectionKeys;
import org.assimbly.gateway.repository.ConnectionRepository;
import org.assimbly.gateway.service.ConnectionService;
import org.assimbly.gateway.service.dto.ConnectionDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Connection.
 */
@RestController
@RequestMapping("/api")
public class ConnectionResource {

    private final Logger log = LoggerFactory.getLogger(ConnectionResource.class);

    private static final String ENTITY_NAME = "connection";

    private final ConnectionService connectionService;

    @Autowired
    ConnectionRepository connectionRepository;

    public ConnectionResource(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    /**
     * POST  /connections : Create a new connection.
     *
     * @param connectionDTO the connectionDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new connectionDTO, or with status 400 (Bad Request) if the connection has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/connections")
    public ResponseEntity<ConnectionDTO> createConnection(@RequestBody ConnectionDTO connectionDTO) throws URISyntaxException {
        log.debug("REST request to save Connection : {}", connectionDTO);
        if (connectionDTO.getId() != null) {
            throw new BadRequestAlertException("A new connection cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ConnectionDTO result = connectionService.save(connectionDTO);
        return ResponseEntity
            .created(new URI("/api/connections/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /connections : Updates an existing connection.
     *
     * @param connectionDTO the connectionDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated connectionDTO,
     * or with status 400 (Bad Request) if the connectionDTO is not valid,
     * or with status 500 (Internal Server Error) if the connectionDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/connections")
    public ResponseEntity<ConnectionDTO> updateConnection(@RequestBody ConnectionDTO connectionDTO) throws URISyntaxException {
        log.debug("REST request to update Connection : {}", connectionDTO);
        if (connectionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ConnectionDTO result = connectionService.save(connectionDTO);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, connectionDTO.getId().toString())).body(result);
    }

    /**
     * GET  /connections : get all the connections.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of connections in body
     */
    @GetMapping("/connections")
    public ResponseEntity<List<ConnectionDTO>> getAllConnections(Pageable pageable) {
        log.debug("REST request to get all Connections");
        Page<ConnectionDTO> page = connectionService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/connections");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/connections/getallconnections")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ConnectionDTO>> getAllConnections() {
        log.debug("REST request to get all Connections 2");
        List<ConnectionDTO> connectionsList = connectionService.getAll();
        return ResponseEntity.ok().body(connectionsList);
    }

    /**
     * GET  /connections/:id : get the "id" connection.
     *
     * @param id the id of the connectionDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the connectionDTO, or with status 404 (Not Found)
     */
    @GetMapping("/connections/{id}")
    public ResponseEntity<ConnectionDTO> getConnection(@PathVariable Long id) {
        log.debug("REST request to get Connection : {}", id);
        Optional<ConnectionDTO> connectionDTO = connectionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(connectionDTO);
    }

    /**
     * GET  /connections/:id/keys : get the keys for a connection with "id".
     *
     * @param id the id of the connectionsKeys to retrieve
     * @return the Treemap (JSON Object)
     */
    @GetMapping("/connections/{id}/keys")
    public TreeMap<String, String> getConnectionKeys(@PathVariable Long id) {
        log.debug("REST request to get Header : {}", id);
        String idAsString = Long.toString(id);
        TreeMap<String, String> connectionMap = getKeys(idAsString);
        return connectionMap;
    }

    /**
     * DELETE  /connections/:id : delete the "id" connection.
     *
     * @param id the id of the connectionDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/connections/{id}")
    public ResponseEntity<Void> deleteConnection(@PathVariable Long id) {
        log.debug("REST request to delete Connection : {}", id);
        connectionService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    private TreeMap<String, String> getKeys(String connectionId) {
        TreeMap<String, String> connectionMap = new TreeMap<>();

        Long connectionIdLong = Long.valueOf(connectionId);
        Optional<Connection> connection = connectionRepository.findById(connectionIdLong);

        if (connection.isPresent()) {
            Set<ConnectionKeys> connectionKeys = connection.get().getConnectionKeys();

            for (ConnectionKeys connectionKey : connectionKeys) {
                String key = "connection." + connectionId + "." + connectionKey.getKey();
                String value = connectionKey.getValue();
                connectionMap.put(key, value);
            }
        }

        return connectionMap;
    }
}
