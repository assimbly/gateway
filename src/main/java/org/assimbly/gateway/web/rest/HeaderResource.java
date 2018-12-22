package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.assimbly.gateway.domain.Header;

import org.assimbly.gateway.repository.HeaderRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.HeaderDTO;
import org.assimbly.gateway.service.mapper.HeaderMapper;
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
 * REST controller for managing Header.
 */
@RestController
@RequestMapping("/api")
public class HeaderResource {

    private final Logger log = LoggerFactory.getLogger(HeaderResource.class);

    private static final String ENTITY_NAME = "header";

    private final HeaderRepository headerRepository;

    private final HeaderMapper headerMapper;

    public HeaderResource(HeaderRepository headerRepository, HeaderMapper headerMapper) {
        this.headerRepository = headerRepository;
        this.headerMapper = headerMapper;
    }

    /**
     * POST  /headers : Create a new header.
     *
     * @param headerDTO the headerDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new headerDTO, or with status 400 (Bad Request) if the header has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/headers")
    @Timed
    public ResponseEntity<HeaderDTO> createHeader(@RequestBody HeaderDTO headerDTO) throws URISyntaxException {
        log.debug("REST request to save Header : {}", headerDTO);
        if (headerDTO.getId() != null) {
            throw new BadRequestAlertException("A new header cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Header header = headerMapper.toEntity(headerDTO);
        header = headerRepository.save(header);
        HeaderDTO result = headerMapper.toDto(header);
        return ResponseEntity.created(new URI("/api/headers/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /headers : Updates an existing header.
     *
     * @param headerDTO the headerDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated headerDTO,
     * or with status 400 (Bad Request) if the headerDTO is not valid,
     * or with status 500 (Internal Server Error) if the headerDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/headers")
    @Timed
    public ResponseEntity<HeaderDTO> updateHeader(@RequestBody HeaderDTO headerDTO) throws URISyntaxException {
        log.debug("REST request to update Header : {}", headerDTO);
        if (headerDTO.getId() == null) {
            return createHeader(headerDTO);
        }
        Header header = headerMapper.toEntity(headerDTO);
        header = headerRepository.save(header);
        HeaderDTO result = headerMapper.toDto(header);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, headerDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /headers : get all the headers.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of headers in body
     */
    @GetMapping("/headers")
    @Timed
    public List<HeaderDTO> getAllHeaders() {
        log.debug("REST request to get all Headers");
        List<Header> headers = headerRepository.findAll();
        return headerMapper.toDto(headers);
        }

    /**
     * GET  /headers/:id : get the "id" header.
     *
     * @param id the id of the headerDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the headerDTO, or with status 404 (Not Found)
     */
    @GetMapping("/headers/{id}")
    @Timed
    public ResponseEntity<HeaderDTO> getHeader(@PathVariable Long id) {
        log.debug("REST request to get Header : {}", id);
        Header header = headerRepository.findOne(id);
        HeaderDTO headerDTO = headerMapper.toDto(header);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(headerDTO));
    }

    /**
     * DELETE  /headers/:id : delete the "id" header.
     *
     * @param id the id of the headerDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/headers/{id}")
    @Timed
    public ResponseEntity<Void> deleteHeader(@PathVariable Long id) {
        log.debug("REST request to delete Header : {}", id);
        headerRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
