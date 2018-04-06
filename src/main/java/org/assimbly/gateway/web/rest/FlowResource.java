package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.service.mapper.FlowMapper;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing flow.
 */
@RestController
@RequestMapping("/api")
public class FlowResource {

    private final Logger log = LoggerFactory.getLogger(FlowResource.class);

    private static final String ENTITY_NAME = "flow";

    private final FlowRepository flowRepository;
    
    private final FlowMapper flowMapper;

	String flowID;

    public FlowResource(FlowRepository flowRepository, FlowMapper flowMapper) {
        this.flowRepository = flowRepository;
        this.flowMapper = flowMapper;
    }
	
    
    /**
     * POST  /flows : Create a new flow.
     *
     * @param FlowDTO the FlowDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new FlowDTO, or with status 400 (Bad Request) if the flow has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/flows")
    @Timed
    public ResponseEntity<FlowDTO> createflow(@RequestBody FlowDTO FlowDTO) throws URISyntaxException {
        log.debug("REST request to save flow : {}", FlowDTO);
        if (FlowDTO.getId() != null) {
            throw new BadRequestAlertException("A new flow cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Flow flow = flowMapper.toEntity(FlowDTO);
        flow = flowRepository.save(flow);
        FlowDTO result = flowMapper.toDto(flow);
        return ResponseEntity.created(new URI("/api/flows/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /flows : Updates an existing flow.
     *
     * @param FlowDTO the FlowDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated FlowDTO,
     * or with status 400 (Bad Request) if the FlowDTO is not valid,
     * or with status 500 (Internal Server Error) if the FlowDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/flows")
    @Timed
    public ResponseEntity<FlowDTO> updateflow(@RequestBody FlowDTO FlowDTO) throws URISyntaxException {
        log.debug("REST request to update flow : {}", FlowDTO);
        if (FlowDTO.getId() == null) {
            return createflow(FlowDTO);
        }
        Flow flow = flowMapper.toEntity(FlowDTO);
        flow = flowRepository.save(flow);
        FlowDTO result = flowMapper.toDto(flow);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, FlowDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /flows : get all the flows.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of flows in body
     */
    @GetMapping("/flows")
    @Timed
    public ResponseEntity<List<FlowDTO>> getAllflows(Pageable pageable) {
        log.debug("REST request to get a page of flows");
        Page<Flow> page = flowRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/flows");
        return new ResponseEntity<>(flowMapper.toDto(page.getContent()), headers, HttpStatus.OK);
    }

    /**
     * GET  /flows/:id : get the "id" flow.
     *
     * @param id the id of the FlowDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the FlowDTO, or with status 404 (Not Found)
     */
    @GetMapping("/flows/{id}")
    @Timed
    public ResponseEntity<FlowDTO> getflow(@PathVariable Long id) {
        log.debug("REST request to get flow : {}", id);
        Flow flow = flowRepository.findOne(id);
        FlowDTO FlowDTO = flowMapper.toDto(flow);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(FlowDTO));
    }

    /**
     * DELETE  /flows/:id : delete the "id" flow.
     *
     * @param id the id of the FlowDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/flows/{id}")
    @Timed
    public ResponseEntity<Void> deleteflow(@PathVariable Long id) {
        log.debug("REST request to delete complete flow : {}", id);
        flowRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
}