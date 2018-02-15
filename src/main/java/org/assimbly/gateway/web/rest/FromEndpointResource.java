package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.assimbly.gateway.domain.FromEndpoint;

import org.assimbly.gateway.repository.FromEndpointRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.FromEndpointDTO;
import org.assimbly.gateway.service.mapper.FromEndpointMapper;
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

    private final FromEndpointRepository fromEndpointRepository;

    private final FromEndpointMapper fromEndpointMapper;

    public FromEndpointResource(FromEndpointRepository fromEndpointRepository, FromEndpointMapper fromEndpointMapper) {
        this.fromEndpointRepository = fromEndpointRepository;
        this.fromEndpointMapper = fromEndpointMapper;
    }

    /**
     * POST  /from-endpoints : Create a new fromEndpoint.
     *
     * @param fromEndpointDTO the fromEndpointDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new fromEndpointDTO, or with status 400 (Bad Request) if the fromEndpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/from-endpoints")
    @Timed
    public ResponseEntity<FromEndpointDTO> createFromEndpoint(@RequestBody FromEndpointDTO fromEndpointDTO) throws URISyntaxException {
        log.debug("REST request to save FromEndpoint : {}", fromEndpointDTO);
        if (fromEndpointDTO.getId() != null) {
            throw new BadRequestAlertException("A new fromEndpoint cannot already have an ID", ENTITY_NAME, "idexists");
        }
        FromEndpoint fromEndpoint = fromEndpointMapper.toEntity(fromEndpointDTO);
        fromEndpoint = fromEndpointRepository.save(fromEndpoint);
        FromEndpointDTO result = fromEndpointMapper.toDto(fromEndpoint);
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
    @Timed
    public ResponseEntity<FromEndpointDTO> updateFromEndpoint(@RequestBody FromEndpointDTO fromEndpointDTO) throws URISyntaxException {
        log.debug("REST request to update FromEndpoint : {}", fromEndpointDTO);
        if (fromEndpointDTO.getId() == null) {
            return createFromEndpoint(fromEndpointDTO);
        }
        FromEndpoint fromEndpoint = fromEndpointMapper.toEntity(fromEndpointDTO);
        fromEndpoint = fromEndpointRepository.save(fromEndpoint);
        FromEndpointDTO result = fromEndpointMapper.toDto(fromEndpoint);
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
    @Timed
    public List<FromEndpointDTO> getAllFromEndpoints() {
        log.debug("REST request to get all FromEndpoints");
        List<FromEndpoint> fromEndpoints = fromEndpointRepository.findAll();
        return fromEndpointMapper.toDto(fromEndpoints);
        }

    /**
     * GET  /from-endpoints/:id : get the "id" fromEndpoint.
     *
     * @param id the id of the fromEndpointDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the fromEndpointDTO, or with status 404 (Not Found)
     */
    @GetMapping("/from-endpoints/{id}")
    @Timed
    public ResponseEntity<FromEndpointDTO> getFromEndpoint(@PathVariable Long id) {
        log.debug("REST request to get FromEndpoint : {}", id);
        FromEndpoint fromEndpoint = fromEndpointRepository.findOne(id);
        FromEndpointDTO fromEndpointDTO = fromEndpointMapper.toDto(fromEndpoint);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(fromEndpointDTO));
    }

    /**
     * DELETE  /from-endpoints/:id : delete the "id" fromEndpoint.
     *
     * @param id the id of the fromEndpointDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/from-endpoints/{id}")
    @Timed
    public ResponseEntity<Void> deleteFromEndpoint(@PathVariable Long id) {
        log.debug("REST request to delete FromEndpoint : {}", id);
        fromEndpointRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
