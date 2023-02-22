package org.assimbly.gateway.web.rest.integration;

import org.assimbly.gateway.service.LinkService;
import org.assimbly.gateway.service.dto.LinkDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Link.
 */
@RestController
@RequestMapping("/api")
public class LinkResource {

    private final Logger log = LoggerFactory.getLogger(LinkResource.class);

    private static final String ENTITY_NAME = "link";

    private final LinkService linkService;

    public LinkResource(LinkService linkService) {
        this.linkService = linkService;
    }

    /**
     * POST  /link : Create a new link.
     *
     * @param linkDTO the linkDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new linkDTO, or with status 400 (Bad Request) if the link has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/link")
    public ResponseEntity<LinkDTO> createLink(@RequestBody LinkDTO linkDTO) throws URISyntaxException {
        log.debug("REST request to save Link : {}", linkDTO);
        if (linkDTO.getId() != null) {
            throw new BadRequestAlertException("A new link cannot already have an ID", ENTITY_NAME, "idexists");
        }

        LinkDTO result = linkService.save(linkDTO);

        return ResponseEntity
            .created(new URI("/api/link/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /link : Updates an existing link.
     *
     * @param linkDTO the linkDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated linkDTO,
     * or with status 400 (Bad Request) if the linkDTO is not valid,
     * or with status 500 (Internal Server Error) if the linkDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/link")
    public ResponseEntity<LinkDTO> updateLink(@RequestBody LinkDTO linkDTO) throws URISyntaxException {
        log.debug("REST request to update Link : {}", linkDTO);
        if (linkDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        LinkDTO result = linkService.save(linkDTO);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, linkDTO.getId().toString())).body(result);
    }

    /**
     * GET  /link : get all the link.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of link in body
     */
    @GetMapping("/link")
    public List<LinkDTO> getAllLink() {
        log.debug("REST request to get all Link");
        return linkService.findAll();
    }

    /**
     * GET  /link/:id : get the "id" link.
     *
     * @param id the id of the linkDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the linkDTO, or with status 404 (Not Found)
     */
    @GetMapping("/link/{id}")
    public ResponseEntity<LinkDTO> getLink(@PathVariable Long id) {
        log.debug("REST request to get Link : {}", id);
        Optional<LinkDTO> linkDTO = linkService.findOne(id);
        return ResponseUtil.wrapOrNotFound(linkDTO);
    }

    /**
     * DELETE  /link/:id : delete the "id" link.
     *
     * @param id the id of the linkDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/link/{id}")
    public ResponseEntity<Void> deleteLink(@PathVariable Long id) {
        log.debug("REST request to delete Link : {}", id);
        linkService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
