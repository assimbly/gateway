package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.domain.Endpoint;
import org.assimbly.gateway.repository.EndpointRepository;
import org.assimbly.gateway.service.EndpointService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.EndpointDTO;
import org.assimbly.gateway.service.mapper.EndpointMapper;

import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Endpoint.
 */
@RestController
@RequestMapping("/api")
public class EndpointResource {

    private final Logger log = LoggerFactory.getLogger(EndpointResource.class);

    private static final String ENTITY_NAME = "endpoint";

    private final EndpointService endpointService;

	private final EndpointRepository endpointRepository;

	private final EndpointMapper endpointMapper;

    public EndpointResource(EndpointService endpointService, EndpointRepository endpointRepository, EndpointMapper endpointMapper) {
        this.endpointService = endpointService;
        this.endpointRepository = endpointRepository;
        this.endpointMapper = endpointMapper;
    }

    /**
     * POST  /endpoints : Create a new endpoint.
     *
     * @param endpointDTO the endpointDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new endpointDTO, or with status 400 (Bad Request) if the endpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/endpoint")
    public ResponseEntity<EndpointDTO> createEndpoint(@RequestBody EndpointDTO endpointDTO) throws URISyntaxException {
        log.debug("REST request to save Endpoint : {}", endpointDTO);
        if (endpointDTO.getId() != null) {
            throw new BadRequestAlertException("A new endpoint cannot already have an ID", ENTITY_NAME, "idexists");
        }

        EndpointDTO result = endpointService.save(endpointDTO);
        return ResponseEntity.created(new URI("/api/from-endpoints/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * POST  /endpoints : Create a new endpoints.
     *
     * @param endpointsDTO the endpointsDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new endpointDTO, or with status 400 (Bad Request) if the endpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/endpoints")
    public ResponseEntity<List<EndpointDTO>> createEndpoints(@RequestBody List<EndpointDTO> endpointsDTO) throws URISyntaxException {
        log.debug("REST request to save List<Endpoint> : {}", endpointsDTO);

        List<Endpoint> endpoints = endpointMapper.toEntity(endpointsDTO);
        endpoints = endpointRepository.saveAll(endpoints);
        List<EndpointDTO> results = endpointMapper.toDto(endpoints);
        return ResponseEntity.created(new URI("/api/endpoints/"))
        		.body(results);
    }

    /**
     * PUT  /endpoint : Updates an existing endpoint.
     *
     * @param endpointDTO the endpointDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated endpointDTO,
     * or with status 400 (Bad Request) if the endpointDTO is not valid,
     * or with status 500 (Internal Server Error) if the endpointDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/endpoint")
    public ResponseEntity<EndpointDTO> updateEndpoint(@RequestBody EndpointDTO endpointDTO) throws URISyntaxException {
        log.debug("REST request to update Endpoint : {}", endpointDTO);
        if (endpointDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        EndpointDTO result = endpointService.save(endpointDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, endpointDTO.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /endpoints : Updates an existing endpoints.
     *
     * @param endpointsDTO the endpointsDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated endpointsDTO,
     * or with status 400 (Bad Request) if the endpointsDTO is not valid,
     * or with status 500 (Internal Server Error) if the endpointsDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/endpoints")
    public ResponseEntity<List<EndpointDTO>> updateEndpoints(@RequestBody List<EndpointDTO> endpointsDTO) throws URISyntaxException {
        log.debug("REST request to update Endpoints : {}", endpointsDTO);

        List<Endpoint> endpoints = endpointMapper.toEntity(endpointsDTO);
        endpoints = endpointRepository.saveAll(endpoints);
        List<EndpointDTO> results = endpointMapper.toDto(endpoints);

        return ResponseEntity.ok().body(results);
    }

    /**
     * GET  /endpoints : get all the endpoints.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of endpoints in body
     */
    @GetMapping("/endpoints")
    public List<EndpointDTO> getAllEndpoints() {
        log.debug("REST request to get all Endpoints");
        return endpointService.findAll();
    }

    /**
     * GET  /endpoints/byflowid/:id : get the "id" endpoint.
     *
     * @param id the id of the endpointDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the endpointDTO, or with status 404 (Not Found)
     */
    @GetMapping("/endpoints/byflowid/{id}")
    public List<EndpointDTO> getEndpointByFlowID(@PathVariable Long id) {
        log.debug("REST request to get Endpoints by flowId " + id);
        List<Endpoint> endpoints = endpointRepository.findByFlowId(id);
        return endpointMapper.toDto(endpoints);
    }

    /**
     * GET  /endpoint/:id : get the "id" endpoint.
     *
     * @param id the id of the endpointDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the endpointDTO, or with status 404 (Not Found)
     */
    @GetMapping("/endpoint/{id}")
    public ResponseEntity<EndpointDTO> getEndpointID(@PathVariable Long id) {
        log.debug("REST request to get Endpoint : {}", id);
        Optional<EndpointDTO> endpointDTO = endpointService.findOne(id);
        return ResponseUtil.wrapOrNotFound(endpointDTO);
    }

    /**
     * DELETE  /endpoints/:id : delete the "id" endpoint.
     *
     * @param id the id of the endpointDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/endpoints/{id}")
    public ResponseEntity<Void> deleteEndpoint(@PathVariable Long id) {
        log.debug("REST request to delete Endpoint : {}", id);
        endpointService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * DELETE  /endpoints : delete list of endpoints.
     *
    * @param list of endpointsDTO's to delete
      * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/endpoints")
    public ResponseEntity<Void> deleteEndpoints(@RequestBody List<EndpointDTO> endpointsDTO) throws URISyntaxException {
        log.debug("REST request to delete List<Endpoint> : {}", endpointsDTO);
        List<Endpoint> endpoints = endpointMapper.toEntity(endpointsDTO);

        ArrayList<String> arrayOfIds = new ArrayList<String>();
        for (Endpoint endpoint : endpoints) {
        	arrayOfIds.add(endpoint.getId().toString());
        }

        endpointRepository.deleteInBatch(endpoints);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, arrayOfIds.toString())).build();
    }


}
