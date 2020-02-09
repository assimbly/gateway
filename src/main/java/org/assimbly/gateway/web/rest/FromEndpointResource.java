package org.assimbly.gateway.web.rest;


import org.assimbly.gateway.service.FromEndpointService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.FromEndpointDTO;
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
 * REST controller for managing FromEndpoint.
 */
@RestController
@RequestMapping("/api")
public class FromEndpointResource {

    private final Logger log = LoggerFactory.getLogger(FromEndpointResource.class);

    private static final String ENTITY_NAME = "fromEndpoint";

    private final FromEndpointService fromEndpointService;

    public FromEndpointResource(FromEndpointService fromEndpointService) {
        this.fromEndpointService = fromEndpointService;
    }

    /**
     * POST  /from-endpoints : Create a new fromEndpoint.
     *
     * @param fromEndpointDTO the fromEndpointDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new fromEndpointDTO, or with status 400 (Bad Request) if the fromEndpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/from-endpoints")
    
    public ResponseEntity<FromEndpointDTO> createFromEndpoint(@RequestBody FromEndpointDTO fromEndpointDTO) throws URISyntaxException {
        log.debug("REST request to save FromEndpoint : {}", fromEndpointDTO);
        if (fromEndpointDTO.getId() != null) {
            throw new BadRequestAlertException("A new fromEndpoint cannot already have an ID", ENTITY_NAME, "idexists");
        }
        FromEndpointDTO result = fromEndpointService.save(fromEndpointDTO);
        return ResponseEntity.created(new URI("/api/from-endpoints/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /from-endpoints : Updates an existing fromEndpoint.
     *
     * @param fromEndpointDTO the fromEndpointDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated fromEndpointDTO,
     * or with status 400 (Bad Request) if the fromEndpointDTO is not valid,
     * or with status 500 (Internal Server Error) if the fromEndpointDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/from-endpoints")
    
    public ResponseEntity<FromEndpointDTO> updateFromEndpoint(@RequestBody FromEndpointDTO fromEndpointDTO) throws URISyntaxException {
        log.debug("REST request to update FromEndpoint : {}", fromEndpointDTO);
        if (fromEndpointDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        FromEndpointDTO result = fromEndpointService.save(fromEndpointDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, fromEndpointDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /from-endpoints : get all the fromEndpoints.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of fromEndpoints in body
     */
    @GetMapping("/from-endpoints")
    
    public List<FromEndpointDTO> getAllFromEndpoints() {
        log.debug("REST request to get all FromEndpoints");
        return fromEndpointService.findAll();
    }

    /**
     * GET  /from-endpoints/:id : get the "id" fromEndpoint.
     *
     * @param id the id of the fromEndpointDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the fromEndpointDTO, or with status 404 (Not Found)
     */
    @GetMapping("/from-endpoints/{id}")
    
    public ResponseEntity<FromEndpointDTO> getFromEndpoint(@PathVariable Long id) {
        log.debug("REST request to get FromEndpoint : {}", id);
        Optional<FromEndpointDTO> fromEndpointDTO = fromEndpointService.findOne(id);
        return ResponseUtil.wrapOrNotFound(fromEndpointDTO);
    }

    /**
     * DELETE  /from-endpoints/:id : delete the "id" fromEndpoint.
     *
     * @param id the id of the fromEndpointDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/from-endpoints/{id}")
    
    public ResponseEntity<Void> deleteFromEndpoint(@PathVariable Long id) {
        log.debug("REST request to delete FromEndpoint : {}", id);
        fromEndpointService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
