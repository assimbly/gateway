package org.assimbly.gateway.web.rest.integration;

import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.repository.HeaderRepository;
import org.assimbly.gateway.service.HeaderService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.HeaderDTO;

import tech.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

/**
 * REST controller for managing Header.
 */
@RestController
@RequestMapping("/api")
public class HeaderResource {

    private final Logger log = LoggerFactory.getLogger(HeaderResource.class);

    private static final String ENTITY_NAME = "header";

    private final HeaderService headerService;

    @Autowired
    HeaderRepository headerRepository;

    public HeaderResource(HeaderService headerService) {
        this.headerService = headerService;
    }

    /**
     * POST  /headers : Create a new header.
     *
     * @param headerDTO the headerDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new headerDTO, or with status 400 (Bad Request) if the header has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/headers")
    public ResponseEntity<HeaderDTO> createHeader(@RequestBody HeaderDTO headerDTO) throws URISyntaxException {
        log.debug("REST request to save Header : {}", headerDTO);
        if (headerDTO.getId() != null) {
            throw new BadRequestAlertException("A new header cannot already have an ID", ENTITY_NAME, "idexists");
        }
        HeaderDTO result = headerService.save(headerDTO);
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
    public ResponseEntity<HeaderDTO> updateHeader(@RequestBody HeaderDTO headerDTO) throws URISyntaxException {
        log.debug("REST request to update Header : {}", headerDTO);
        if (headerDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        HeaderDTO result = headerService.save(headerDTO);
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
    public ResponseEntity<List<HeaderDTO>> getAllHeaders(Pageable pageable) {
        log.debug("REST request to get all Headers");
        Page<HeaderDTO> page = headerService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/headers");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /headers : get all the headers.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of headers in body
     */


    @GetMapping("/headers/getallheaders")
    @Transactional(readOnly = true)
    public ResponseEntity<List<HeaderDTO>> getAllHeaders() {
        log.debug("REST request to get all Headers 2");
        List<HeaderDTO> headersList = headerService.getAll();
        return ResponseEntity.ok().body(headersList);
    }

    /**
     * GET  /headers/:id : get the "id" header.
     *
     * @param id the id of the headerDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the headerDTO, or with status 404 (Not Found)
     */
    @GetMapping("/headers/{id}")
    public ResponseEntity<HeaderDTO> getHeader(@PathVariable Long id) {
        log.debug("REST request to get Header : {}", id);
        Optional<HeaderDTO> headerDTO = headerService.findOne(id);
        return ResponseUtil.wrapOrNotFound(headerDTO);
    }

    /**
     * DELETE  /headers/:id : delete the "id" header.
     *
     * @param id the id of the headerDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/headers/{id}")
    public ResponseEntity<Void> deleteHeader(@PathVariable Long id) {
        log.debug("REST request to delete Header : {}", id);
        headerService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }


    /**
     * GET  /headers/:id/keys : get the "id" header.
     *
     * @param id the id of the headerKeys to retrieve
     * @return the Treemap (JSON Object)
     */
    @GetMapping("/headers/{id}/keys")
    public TreeMap<String, Object> getHeaderKeys(@PathVariable Long id) {
        log.debug("REST request to get Header : {}", id);
        String idAsString = Long.toString(id);
        TreeMap<String, Object> headerMap = getKeys(idAsString);
        return headerMap;
    }


    private TreeMap<String, Object> getKeys(String headerId){

        TreeMap<String, Object> headerMap = new TreeMap<>();

        Long headerIdLong =  Long.valueOf(headerId);
        Optional<Header> header = headerRepository.findById(headerIdLong);

        if(header.isPresent()){
            Set<HeaderKeys> headerKeys = header.get().getHeaderKeys();

            for (HeaderKeys headerKey : headerKeys) {
                String key = headerKey.getKey();
                String value= headerKey.getType() + "(" + headerKey.getValue() + ")";

                headerMap.put(key, value);
            }
        }

        return headerMap;
    }


}
