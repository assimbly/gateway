package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.config.environment.BrokerManager;
import org.assimbly.gateway.domain.Gateway;
import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.GatewayService;
import org.assimbly.gateway.service.dto.GatewayDTO;

import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

import javax.annotation.PostConstruct;

/**
 * REST controller for managing Gateway.
 */
@RestController
@RequestMapping("/api")
public class GatewayResource {

    private final Logger log = LoggerFactory.getLogger(GatewayResource.class);

    private static final String ENTITY_NAME = "gateway";

    private final GatewayRepository gatewayRepository;

	private final GatewayService gatewayService;

	private String gatewayType;
	
    public GatewayResource(GatewayService gatewayService, GatewayRepository gatewayRepository) {
        this.gatewayService = gatewayService;
        this.gatewayRepository = gatewayRepository;
    }
    
    /**
     * POST  /gateways : Create a new gateway.
     *
     * @param gatewayDTO the gatewayDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new gatewayDTO, or with status 400 (Bad Request) if the gateway has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/gateways")
    public ResponseEntity<GatewayDTO> createGateway(@RequestBody GatewayDTO gatewayDTO) throws URISyntaxException {
        log.debug("REST request to save Gateway : {}", gatewayDTO);
        if (gatewayDTO.getId() != null) {
            throw new BadRequestAlertException("A new gateway cannot already have an ID", ENTITY_NAME, "idexists");
        }
        GatewayDTO result = gatewayService.save(gatewayDTO);
        return ResponseEntity.created(new URI("/api/gateways/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /gateways : Updates an existing gateway.
     *
     * @param gatewayDTO the gatewayDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated gatewayDTO,
     * or with status 400 (Bad Request) if the gatewayDTO is not valid,
     * or with status 500 (Internal Server Error) if the gatewayDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/gateways")
    public ResponseEntity<GatewayDTO> updateGateway(@RequestBody GatewayDTO gatewayDTO) throws URISyntaxException {

    	log.debug("REST request to update Gateway : {}", gatewayDTO);
        if (gatewayDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
             
        gatewayType = gatewayDTO.getType().name();
        GatewayDTO result = gatewayService.save(gatewayDTO);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, gatewayDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /gateways : get all the gateways.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of gateways in body
     */
    @GetMapping("/gateways")
    public List<GatewayDTO> getAllGateways() {
        log.debug("REST request to get all Gateways");
        return gatewayService.findAll();
    }

    /**
     * GET  /gateways/:id : get the "id" gateway.
     *
     * @param id the id of the gatewayDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the gatewayDTO, or with status 404 (Not Found)
     */
    @GetMapping("/gateways/{id}")
    public ResponseEntity<GatewayDTO> getGateway(@PathVariable Long id) {
        log.debug("REST request to get Gateway : {}", id);
        Optional<GatewayDTO> gatewayDTO = gatewayService.findOne(id);
        return ResponseUtil.wrapOrNotFound(gatewayDTO);
    }

    /**
     * DELETE  /gateways/:id : delete the "id" gateway.
     *
     * @param id the id of the gatewayDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/gateways/{id}")
    public ResponseEntity<Void> deleteGateway(@PathVariable Long id) {
        log.debug("REST request to delete Gateway : {}", id);

        gatewayRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
}
