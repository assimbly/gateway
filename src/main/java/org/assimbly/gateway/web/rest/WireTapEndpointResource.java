package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.assimbly.gateway.domain.WireTapEndpoint;
import org.assimbly.gateway.repository.WireTapEndpointRepository;
import org.assimbly.gateway.service.dto.WireTapEndpointDTO;
import org.assimbly.gateway.service.mapper.WireTapEndpointMapper;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing WireTapEndpoint.
 */
@RestController
@RequestMapping("/api")
public class WireTapEndpointResource {

    private final Logger log = LoggerFactory.getLogger(WireTapEndpointResource.class);

    private static final String ENTITY_NAME = "wireTapEndpoint";

    private final WireTapEndpointRepository wireTapEndpointRepository;

    private final WireTapEndpointMapper wireTapEndpointMapper;

    public WireTapEndpointResource(WireTapEndpointRepository wireTapEndpointRepository, WireTapEndpointMapper wireTapEndpointMapper) {
        this.wireTapEndpointRepository = wireTapEndpointRepository;
        this.wireTapEndpointMapper = wireTapEndpointMapper;
    }
    
    /**
     * POST  /wire-tap-endpoints : Create a new wireTapEndpoint.
     *
     * @param wireTapEndpoint the wireTapEndpoint to create
     * @return the ResponseEntity with status 201 (Created) and with body the new wireTapEndpoint, or with status 400 (Bad Request) if the wireTapEndpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/wire-tap-endpoints")
    @Timed
    public ResponseEntity<WireTapEndpointDTO> createWireTapEndpoint(@RequestBody WireTapEndpointDTO wireTapEndpointDTO) throws URISyntaxException {
        log.debug("REST request to save WireTapEndpoint : {}", wireTapEndpointDTO);
        if (wireTapEndpointDTO.getId() != null) {
            throw new BadRequestAlertException("A new wireTapEndpoint cannot already have an ID", ENTITY_NAME, "idexists");
        }
        
        WireTapEndpoint wireTapEndpoint = wireTapEndpointMapper.toEntity(wireTapEndpointDTO);
        wireTapEndpoint = wireTapEndpointRepository.save(wireTapEndpoint);
        WireTapEndpointDTO result = wireTapEndpointMapper.toDto(wireTapEndpoint);

        
        return ResponseEntity.created(new URI("/api/wire-tap-endpoints/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /wire-tap-endpoints : Updates an existing wireTapEndpoint.
     *
     * @param wireTapEndpoint the wireTapEndpoint to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated wireTapEndpoint,
     * or with status 400 (Bad Request) if the wireTapEndpoint is not valid,
     * or with status 500 (Internal Server Error) if the wireTapEndpoint couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/wire-tap-endpoints")
    @Timed
    public ResponseEntity<WireTapEndpointDTO> updateWireTapEndpoint(@RequestBody WireTapEndpointDTO wireTapEndpointDTO) throws URISyntaxException {
        log.debug("REST request to update WireTapEndpoint : {}", wireTapEndpointDTO);
        if (wireTapEndpointDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        WireTapEndpoint wireTapEndpoint = wireTapEndpointMapper.toEntity(wireTapEndpointDTO);
        wireTapEndpoint = wireTapEndpointRepository.save(wireTapEndpoint);
        WireTapEndpointDTO result = wireTapEndpointMapper.toDto(wireTapEndpoint);
        
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, wireTapEndpointDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /wire-tap-endpoints : get all the wireTapEndpoints.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of wireTapEndpoints in body
     */
    @GetMapping("/wire-tap-endpoints")
    @Timed
    public List<WireTapEndpoint> getAllWireTapEndpoints() {
        log.debug("REST request to get all WireTapEndpoints");
        return wireTapEndpointRepository.findAll();
    }

    /**
     * GET  /wire-tap-endpoints/:id : get the "id" wireTapEndpoint.
     *
     * @param id the id of the wireTapEndpoint to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the wireTapEndpoint, or with status 404 (Not Found)
     */
    @GetMapping("/wire-tap-endpoints/{id}")
    @Timed
    public ResponseEntity<WireTapEndpoint> getWireTapEndpoint(@PathVariable Long id) {
        log.debug("REST request to get WireTapEndpoint : {}", id);
        Optional<WireTapEndpoint> wireTapEndpoint = wireTapEndpointRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(wireTapEndpoint);
    }

    /**
     * DELETE  /wire-tap-endpoints/:id : delete the "id" wireTapEndpoint.
     *
     * @param id the id of the wireTapEndpoint to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/wire-tap-endpoints/{id}")
    @Timed
    public ResponseEntity<Void> deleteWireTapEndpoint(@PathVariable Long id) {
        log.debug("REST request to delete WireTapEndpoint : {}", id);

        wireTapEndpointRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
