package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.repository.ToEndpointRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.ToEndpointDTO;
import org.assimbly.gateway.service.mapper.ToEndpointMapper;
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
 * REST controller for managing ToEndpoint.
 */
@RestController
@RequestMapping("/api")
public class ToEndpointResource {

    private final Logger log = LoggerFactory.getLogger(ToEndpointResource.class);

    private static final String ENTITY_NAME = "toEndpoint";

    private final ToEndpointRepository toEndpointRepository;

    private final ToEndpointMapper toEndpointMapper;

    public ToEndpointResource(ToEndpointRepository toEndpointRepository, ToEndpointMapper toEndpointMapper) {
        this.toEndpointRepository = toEndpointRepository;
        this.toEndpointMapper = toEndpointMapper;
    }

    /**
     * POST  /to-endpoint : Create a new toEndpoint.
     *
     * @param toEndpointDTO the toEndpointDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new toEndpointDTO, or with status 400 (Bad Request) if the toEndpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/to-endpoint")
    @Timed
    public ResponseEntity<ToEndpointDTO> createToEndpoint(@RequestBody ToEndpointDTO toEndpointDTO) throws URISyntaxException {
        log.debug("REST request to save ToEndpoint : {}", toEndpointDTO);
        if (toEndpointDTO.getId() != null) {
            throw new BadRequestAlertException("A new toEndpoint cannot already have an ID", ENTITY_NAME, "idexists");
        }

        ToEndpoint toEndpoint = toEndpointMapper.toEntity(toEndpointDTO);
        toEndpoint = toEndpointRepository.save(toEndpoint);
        ToEndpointDTO result = toEndpointMapper.toDto(toEndpoint);
        return ResponseEntity.created(new URI("/api/to-endpoint/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * POST  /to-endpoints : Create a new toEndpoints.
     *
     * @param toEndpointsDTO the toEndpointsDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new toEndpointDTO, or with status 400 (Bad Request) if the toEndpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/to-endpoints")
    @Timed
    public ResponseEntity<List<ToEndpointDTO>> createToEndpoints(@RequestBody List<ToEndpointDTO> toEndpointsDTO) throws URISyntaxException {
        log.debug("REST request to save List<ToEndpoint> : {}", toEndpointsDTO);
        List<ToEndpoint> toEndpoints = toEndpointMapper.toEntity(toEndpointsDTO);
        toEndpoints = toEndpointRepository.save(toEndpoints);
        List<ToEndpointDTO> results = toEndpointMapper.toDto(toEndpoints);
        return ResponseEntity.created(new URI("/api/to-endpoints/")).body(results);
    }

    /**
     * PUT  /to-endpoint : Updates an existing toEndpoint.
     *
     * @param toEndpointDTO the toEndpointDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated toEndpointDTO,
     * or with status 400 (Bad Request) if the toEndpointDTO is not valid,
     * or with status 500 (Internal Server Error) if the toEndpointDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/to-endpoint")
    @Timed
    public ResponseEntity<ToEndpointDTO> updateToEndpoint(@RequestBody ToEndpointDTO toEndpointDTO) throws URISyntaxException {
        log.debug("REST request to update ToEndpoint : {}", toEndpointDTO);
        if (toEndpointDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        ToEndpoint toEndpoint = toEndpointMapper.toEntity(toEndpointDTO);
        toEndpoint = toEndpointRepository.save(toEndpoint);
        ToEndpointDTO result = toEndpointMapper.toDto(toEndpoint);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, toEndpointDTO.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /to-endpoints : Updates an existing toEndpoints.
     *
     * @param toEndpointsDTO the toEndpointsDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated toEndpointsDTO,
     * or with status 400 (Bad Request) if the toEndpointsDTO is not valid,
     * or with status 500 (Internal Server Error) if the toEndpointsDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/to-endpoints")
    @Timed
    public ResponseEntity<List<ToEndpointDTO>> updateToEndpoints(@RequestBody List<ToEndpointDTO> toEndpointsDTO) throws URISyntaxException {
        log.debug("REST request to update ToEndpoints : {}", toEndpointsDTO);
        List<ToEndpoint> toEndpoints = toEndpointMapper.toEntity(toEndpointsDTO);
        toEndpoints = toEndpointRepository.save(toEndpoints);
        List<ToEndpointDTO> results = toEndpointMapper.toDto(toEndpoints);
        return ResponseEntity.ok().body(results);
    }

    /**
     * GET  /to-endpoints : get all the toEndpoints.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of toEndpoints in body
     */
    @GetMapping("/to-endpoints")
    @Timed
    public List<ToEndpointDTO> getAllToEndpoints() {
        log.debug("REST request to get all ToEndpoints");
        List<ToEndpoint> toEndpoints = toEndpointRepository.findAll();
        return toEndpointMapper.toDto(toEndpoints);
    }

    /**
     * GET  /to-endpoints/:id : get the "id" toEndpoint.
     *
     * @param id the id of the toEndpointDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the toEndpointDTO, or with status 404 (Not Found)
     */
    @GetMapping("/to-endpoints/byflowid/{id}")
    @Timed
    public List<ToEndpointDTO> getToEndpointByFlowID(@PathVariable Long id) {
        log.debug("REST request to get ToEndpoints by flowId " + id);
        List<ToEndpoint> toEndpoints = toEndpointRepository.findByFlowId(id);
        return toEndpointMapper.toDto(toEndpoints);
    }  
    
    /**
     * GET  /to-endpoint/:id : get the "id" toEndpoint.
     *
     * @param id the id of the toEndpointDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the toEndpointDTO, or with status 404 (Not Found)
     */
    @GetMapping("/to-endpoint/{id}")
    @Timed
    public ResponseEntity<ToEndpointDTO> getToEndpointID(@PathVariable Long id) {
        log.debug("REST request to get ToEndpoint : {}", id);
        Optional<ToEndpointDTO> toEndpointDTO = toEndpointRepository.findById(id)
            .map(toEndpointMapper::toDto);
        return ResponseUtil.wrapOrNotFound(toEndpointDTO);
    }

    /**
     * DELETE  /to-endpoint/:id : delete the "id" toEndpoint.
     *
     * @param id the id of the toEndpointDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/to-endpoint/{id}")
    @Timed
    public ResponseEntity<Void> deleteToEndpoint(@PathVariable Long id) {
        log.debug("REST request to delete ToEndpoint : {}", id);

        toEndpointRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
    /**
     * DELETE  /to-endpoints : delete list of toEndpoints.
     *
    * @param list of toEndpointsDTO's to delete
      * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/to-endpoints")
    @Timed
    public ResponseEntity<Void> deleteToEndpoints(@RequestBody List<ToEndpointDTO> toEndpointsDTO) throws URISyntaxException {
        log.debug("REST request to delete List<ToEndpoint> : {}", toEndpointsDTO);
        List<ToEndpoint> toEndpoints = toEndpointMapper.toEntity(toEndpointsDTO);
        
        ArrayList<String> arrayOfIds = new ArrayList<String>();
        for (ToEndpoint toEndpoint : toEndpoints) {
        	arrayOfIds.add(toEndpoint.getId().toString());
        }    
	
        toEndpointRepository.deleteInBatch(toEndpoints);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, arrayOfIds.toString())).build();
    }
    
    
}
