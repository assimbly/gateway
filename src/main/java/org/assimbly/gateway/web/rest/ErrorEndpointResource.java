package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.service.ErrorEndpointService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.ErrorEndpointDTO;
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
 * REST controller for managing ErrorEndpoint.
 */
@RestController
@RequestMapping("/api")
public class ErrorEndpointResource {

    private final Logger log = LoggerFactory.getLogger(ErrorEndpointResource.class);

    private static final String ENTITY_NAME = "errorEndpoint";

    private final ErrorEndpointService errorEndpointService;

    public ErrorEndpointResource(ErrorEndpointService errorEndpointService) {
        this.errorEndpointService = errorEndpointService;
    }

    /**
     * POST  /error-endpoints : Create a new errorEndpoint.
     *
     * @param errorEndpointDTO the errorEndpointDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new errorEndpointDTO, or with status 400 (Bad Request) if the errorEndpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/error-endpoints")
    public ResponseEntity<ErrorEndpointDTO> createErrorEndpoint(@RequestBody ErrorEndpointDTO errorEndpointDTO) throws URISyntaxException {
        log.debug("REST request to save ErrorEndpoint : {}", errorEndpointDTO);
        if (errorEndpointDTO.getId() != null) {
            throw new BadRequestAlertException("A new errorEndpoint cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ErrorEndpointDTO result = errorEndpointService.save(errorEndpointDTO);
        return ResponseEntity.created(new URI("/api/error-endpoints/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /error-endpoints : Updates an existing errorEndpoint.
     *
     * @param errorEndpointDTO the errorEndpointDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated errorEndpointDTO,
     * or with status 400 (Bad Request) if the errorEndpointDTO is not valid,
     * or with status 500 (Internal Server Error) if the errorEndpointDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/error-endpoints")
    public ResponseEntity<ErrorEndpointDTO> updateErrorEndpoint(@RequestBody ErrorEndpointDTO errorEndpointDTO) throws URISyntaxException {
        log.debug("REST request to update ErrorEndpoint : {}", errorEndpointDTO);
        if (errorEndpointDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ErrorEndpointDTO result = errorEndpointService.save(errorEndpointDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, errorEndpointDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /error-endpoints : get all the errorEndpoints.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of errorEndpoints in body
     */
    @GetMapping("/error-endpoints")
    public List<ErrorEndpointDTO> getAllErrorEndpoints() {
        log.debug("REST request to get all ErrorEndpoints");
        return errorEndpointService.findAll();
    }

    /**
     * GET  /error-endpoints/:id : get the "id" errorEndpoint.
     *
     * @param id the id of the errorEndpointDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the errorEndpointDTO, or with status 404 (Not Found)
     */
    @GetMapping("/error-endpoints/{id}")
    public ResponseEntity<ErrorEndpointDTO> getErrorEndpoint(@PathVariable Long id) {
        log.debug("REST request to get ErrorEndpoint : {}", id);
        Optional<ErrorEndpointDTO> errorEndpointDTO = errorEndpointService.findOne(id);
        return ResponseUtil.wrapOrNotFound(errorEndpointDTO);
    }

    /**
     * DELETE  /error-endpoints/:id : delete the "id" errorEndpoint.
     *
     * @param id the id of the errorEndpointDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/error-endpoints/{id}")
    public ResponseEntity<Void> deleteErrorEndpoint(@PathVariable Long id) {
        log.debug("REST request to delete ErrorEndpoint : {}", id);
        errorEndpointService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
