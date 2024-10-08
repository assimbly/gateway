package org.assimbly.gateway.web.rest.integration;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.assimbly.gateway.service.HeaderService;
import org.assimbly.gateway.service.dto.HeaderDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Header.
 */
@RestController
@RequestMapping("/api")
public class HeaderResource {

    private final Logger log = LoggerFactory.getLogger(HeaderResource.class);

    private static final String ENTITY_NAME = "header";

    private final HeaderService headerService;

    public HeaderResource(HeaderService headerService) {
        this.headerService = headerService;
    }

    /**
     * POST  /header : Create a new header.
     *
     * @param headerDTO the headerDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new headerDTO, or with status 400 (Bad Request) if the header has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/header")
    public ResponseEntity<HeaderDTO> createHeader(@RequestBody HeaderDTO headerDTO) throws URISyntaxException {
        log.debug("REST request to save Header : {}", headerDTO);
        if (headerDTO.getId() != null) {
            throw new BadRequestAlertException("A new header cannot already have an ID", ENTITY_NAME, "idexists");
        }

        HeaderDTO result = headerService.save(headerDTO);

        return ResponseEntity
            .created(new URI("/api/header/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /header : Updates an existing header.
     *
     * @param headerDTO the headerDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated headerDTO,
     * or with status 400 (Bad Request) if the headerDTO is not valid,
     * or with status 500 (Internal Server Error) if the headerDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/header")
    public ResponseEntity<HeaderDTO> updateHeader(@RequestBody HeaderDTO headerDTO) throws URISyntaxException {
        log.debug("REST request to update Header : {}", headerDTO);
        if (headerDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        HeaderDTO result = headerService.save(headerDTO);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, headerDTO.getId().toString())).body(result);
    }

    /**
     * GET  /header : get all the header.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of header in body
     */
    @GetMapping("/header")
    public List<HeaderDTO> getAllHeader() {
        log.debug("REST request to get all Header");
        return headerService.findAll();
    }

    /**
     * GET  /header/:id : get the "id" header.
     *
     * @param id the id of the headerDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the headerDTO, or with status 404 (Not Found)
     */
    @GetMapping("/header/{id}")
    public ResponseEntity<HeaderDTO> getHeader(@PathVariable(value = "id") Long id) {
        log.debug("REST request to get Header : {}", id);
        Optional<HeaderDTO> headerDTO = headerService.findOne(id);
        return ResponseUtil.wrapOrNotFound(headerDTO);
    }

    /**
     * DELETE  /header/:id : delete the "id" header.
     *
     * @param id the id of the headerDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/header/{id}")
    public ResponseEntity<Void> deleteHeader(@PathVariable(value = "id") Long id) {
        log.debug("REST request to delete Header : {}", id);
        headerService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
