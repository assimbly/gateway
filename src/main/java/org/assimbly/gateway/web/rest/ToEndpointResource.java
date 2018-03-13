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
     * POST  /to-endpoints : Create a new toEndpoint.
     *
     * @param toEndpointDTO the toEndpointDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new toEndpointDTO, or with status 400 (Bad Request) if the toEndpoint has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/to-endpoints")
    @Timed
    public ResponseEntity<ToEndpointDTO> createToEndpoint(@RequestBody ToEndpointDTO toEndpointDTO) throws URISyntaxException {
        log.debug("REST request to save ToEndpoint : {}", toEndpointDTO);
        if (toEndpointDTO.getId() != null) {
            throw new BadRequestAlertException("A new toEndpoint cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ToEndpoint toEndpoint = toEndpointMapper.toEntity(toEndpointDTO);
        toEndpoint = toEndpointRepository.save(toEndpoint);
        ToEndpointDTO result = toEndpointMapper.toDto(toEndpoint);
        return ResponseEntity.created(new URI("/api/to-endpoints/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /to-endpoints : Updates an existing toEndpoint.
     *
     * @param toEndpointDTO the toEndpointDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated toEndpointDTO,
     * or with status 400 (Bad Request) if the toEndpointDTO is not valid,
     * or with status 500 (Internal Server Error) if the toEndpointDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/to-endpoints")
    @Timed
    public ResponseEntity<ToEndpointDTO> updateToEndpoint(@RequestBody ToEndpointDTO toEndpointDTO) throws URISyntaxException {
        log.debug("REST request to update ToEndpoint : {}", toEndpointDTO);
        if (toEndpointDTO.getId() == null) {
            return createToEndpoint(toEndpointDTO);
        }
        ToEndpoint toEndpoint = toEndpointMapper.toEntity(toEndpointDTO);
        toEndpoint = toEndpointRepository.save(toEndpoint);
        ToEndpointDTO result = toEndpointMapper.toDto(toEndpoint);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, toEndpointDTO.getId().toString()))
            .body(result);
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
    @GetMapping("/to-endpoints/byrouteid/{id}")
    @Timed
    public ResponseEntity<ToEndpointDTO> getToEndpointByRouteID(@PathVariable Long id) {
        log.debug("REST request to get ToEndpoints by routeid");
        List<ToEndpoint> toEndpoints = toEndpointRepository.findByFlowId(id);
        ToEndpoint toEndpoint = toEndpoints.get(0);
        ToEndpointDTO toEndpointDTO = toEndpointMapper.toDto(toEndpoint);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(toEndpointDTO));
    }    
    /**
     * GET  /to-endpoints/:id : get the "id" toEndpoint.
     *
     * @param id the id of the toEndpointDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the toEndpointDTO, or with status 404 (Not Found)
     */
    @GetMapping("/to-endpoints/{id}")
    @Timed
    public ResponseEntity<ToEndpointDTO> getToEndpointID(@PathVariable Long id) {
        log.debug("REST request to get ToEndpoint : {}", id);
        ToEndpoint toEndpoint = toEndpointRepository.findOne(id);
        ToEndpointDTO toEndpointDTO = toEndpointMapper.toDto(toEndpoint);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(toEndpointDTO));
    }

    /**
     * DELETE  /to-endpoints/:id : delete the "id" toEndpoint.
     *
     * @param id the id of the toEndpointDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/to-endpoints/{id}")
    @Timed
    public ResponseEntity<Void> deleteToEndpoint(@PathVariable Long id) {
        log.debug("REST request to delete ToEndpoint : {}", id);
        toEndpointRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
