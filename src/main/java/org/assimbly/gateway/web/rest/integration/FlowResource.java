package org.assimbly.gateway.web.rest.integration;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.service.FlowService;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.integration.Integration;
import org.assimbly.integrationrest.IntegrationRuntime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing flow.
 */
@Component
@RestController
@RequestMapping("/api")
public class FlowResource {

    private final Logger log = LoggerFactory.getLogger(FlowResource.class);

    private static final String ENTITY_NAME = "flow";

    private final FlowService flowService;

    @Autowired
    private org.assimbly.gateway.config.exporting.Export confExport;

    @Autowired
    FlowRepository flowRepository;

    @Autowired
    EncryptionProperties encryptionProperties;

    @Value("${server.port}")
    private int serverPort;

    private final ApplicationProperties applicationProperties;

    private Integration integration;

    private final IntegrationRuntime integrationRuntime;

    public FlowResource(FlowService flowService, ApplicationProperties applicationProperties, IntegrationRuntime integrationRuntime) {
        this.flowService = flowService;
        this.applicationProperties = applicationProperties;
        this.integrationRuntime = integrationRuntime;
    }

    /**
     * POST  /flows : Create a new flow.
     *
     * @param flowDTO the flowDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new flowDTO, or with status 400 (Bad Request) if the flow has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/flows")
    public ResponseEntity<FlowDTO> createFlow(@RequestBody FlowDTO flowDTO) throws URISyntaxException {
        log.debug("REST request to save Flow : {}", flowDTO);
        if (flowDTO.getId() != null) {
            throw new BadRequestAlertException("A new flow cannot already have an ID", ENTITY_NAME, "idexists");
        }
        FlowDTO result = flowService.save(flowDTO);
        return ResponseEntity
            .created(new URI("/api/flows/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /flows : Updates an existing flow.
     *
     * @param flowDTO the flowDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated flowDTO,
     * or with status 400 (Bad Request) if the flowDTO is not valid,
     * or with status 500 (Internal Server Error) if the flowDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/flows")
    public ResponseEntity<FlowDTO> updateFlow(@RequestBody FlowDTO flowDTO) throws URISyntaxException {
        log.debug("REST request to update Flow : {}", flowDTO);
        if (flowDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        FlowDTO result = flowService.save(flowDTO);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, flowDTO.getId().toString())).body(result);
    }

    /**
     * GET  /flows : get all the flows.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of flows in body
     */
    @GetMapping("/flows")
    public ResponseEntity<List<FlowDTO>> getAllFlows(Pageable pageable) {
        log.debug("REST request to get a page of Flows");
        Page<FlowDTO> page = flowService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/flows");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /flows/byintegrationid/:integrationid : get all the flows for a specific integration (by integrationId).
     *
     * @param integrationid
     * @return the ResponseEntity with status 200 (OK) and the list of flows in body
     */
    @GetMapping("/flows/byintegrationid/{integrationid}")
    public ResponseEntity<List<FlowDTO>> getAllflowsByGatewayId(
        @SortDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable,
        @PathVariable(value = "integrationid") Long integrationid
    ) {
        log.debug("REST request to get a page of flows by integrationid");
        Page<FlowDTO> page = flowService.findAllByIntegrationId(pageable, integrationid);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/flows");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }


    /**
     * GET  /flows/:id : get the "id" flow.
     *
     * @param id the id of the flowDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the flowDTO, or with status 404 (Not Found)
     */
    @GetMapping("/flows/{id}")
    public ResponseEntity<FlowDTO> getFlow(@PathVariable(value = "id") Long id) {
        log.debug("REST request to get Flow : {}", id);
        Optional<FlowDTO> flowDTO = flowService.findOne(id);

        return ResponseUtil.wrapOrNotFound(flowDTO);
    }

    /**
     * DELETE  /flows/:id : delete the "id" flow.
     *
     * @param id the id of the flowDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/flows/{id}")
    public ResponseEntity<Void> deleteFlow(@PathVariable(value = "id") Long id) {
        log.debug("REST request to delete Flow : {}", id);
        flowService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

}
