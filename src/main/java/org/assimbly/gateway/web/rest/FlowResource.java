package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.domain.ToEndpoint;
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
import org.springframework.data.domain.Sort;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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

    public ResponseEntity<FlowDTO> updateFlow(@RequestBody FlowDTO flowDTO) throws URISyntaxException {
        log.debug("REST request to update Flow : {}", flowDTO);
        if (flowDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        Flow flow = flowMapper.toEntity(flowDTO);
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
    public ResponseEntity<List<FlowDTO>> getAllFlows(Pageable pageable) {
        log.debug("REST request to get a page of Flows");
        Page<FlowDTO> page = flowRepository.findAll(pageable).map(flowMapper::toDto);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/flows");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /flows/bygatewayid/:gatewayid : get all the flows for a specific gateway (by gatewaId).
     *
     * @param gatewayid
     * @return the ResponseEntity with status 200 (OK) and the list of flows in body
     */
    @GetMapping("/flows/bygatewayid/{gatewayid}")
    @Timed
    public ResponseEntity<List<FlowDTO>> getAllflowsByGatewayId(@SortDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable, @PathVariable Long gatewayid) {
        log.debug("REST request to get a page of flows by gatewayid");
        Page<Flow> page = flowRepository.findAllByGatewayId(pageable, gatewayid);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/flows");
        return new ResponseEntity<>(flowMapper.toDto(page.getContent()), headers, HttpStatus.OK);
    }
    
    /*
    @GetMapping("/flows/bygatewayid/{gatewayid}")
    @Timed
    public List<FlowDTO> getAllflowsByGatewayId(@PathVariable Long gatewayid) {
    	log.debug("REST request to get flows by gateway ID : {}", gatewayid);
        List<Flow> flows = flowRepository.findAllByGatewayId(gatewayid);
        flows.sort(Comparator.comparing(Flow::getName));
        
        for(Flow flow : flows) {
        	System.out.println("Tname=" + flow.getName());
        }
        
       return flowMapper.toDto(flows);
    }
	*/
    
    /**
     * GET  /flows/:id : get the "id" flow.
     *
     * @param id the id of the FlowDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the FlowDTO, or with status 404 (Not Found)
     */
    @GetMapping("/flows/{id}")
    @Timed
    public ResponseEntity<FlowDTO> getFlow(@PathVariable Long id) {
        log.debug("REST request to get Flow : {}", id);
        Optional<FlowDTO> flowDTO = flowRepository.findById(id)
            .map(flowMapper::toDto);
        return ResponseUtil.wrapOrNotFound(flowDTO);
    }

    /**
     * DELETE  /flows/:id : delete the "id" flow.
     *
     * @param id the id of the FlowDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/flows/{id}")
    @Timed
    public ResponseEntity<Void> deleteFlow(@PathVariable Long id) {
        log.debug("REST request to delete Flow : {}", id);

        flowRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
}