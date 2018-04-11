package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.assimbly.gateway.config.flows.AssimblyDBConfiguration;
import org.assimbly.gateway.domain.Gateway;

import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.GatewayDTO;
import org.assimbly.gateway.service.mapper.GatewayMapper;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Gateway.
 */
@RestController
@RequestMapping("/api")
public class GatewayResource {

    private final Logger log = LoggerFactory.getLogger(GatewayResource.class);

    private static final String ENTITY_NAME = "gateway";

    private final GatewayRepository gatewayRepository;

    private final GatewayMapper gatewayMapper;

	@Autowired
	private AssimblyDBConfiguration assimblyDBConfiguration;

    public GatewayResource(GatewayRepository gatewayRepository, GatewayMapper gatewayMapper) {
        this.gatewayRepository = gatewayRepository;
        this.gatewayMapper = gatewayMapper;
    }

    /**
     * POST  /gateways : Create a new gateway.
     *
     * @param gatewayDTO the gatewayDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new gatewayDTO, or with status 400 (Bad Request) if the gateway has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/gateways")
    @Timed
    public ResponseEntity<GatewayDTO> createGateway(@RequestBody GatewayDTO gatewayDTO) throws URISyntaxException {
        log.debug("REST request to save Gateway : {}", gatewayDTO);
        if (gatewayDTO.getId() != null) {
            throw new BadRequestAlertException("A new gateway cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Gateway gateway = gatewayMapper.toEntity(gatewayDTO);
        gateway = gatewayRepository.save(gateway);
        GatewayDTO result = gatewayMapper.toDto(gateway);
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
    @Timed
    public ResponseEntity<GatewayDTO> updateGateway(@RequestBody GatewayDTO gatewayDTO) throws URISyntaxException {
        log.debug("REST request to update Gateway : {}", gatewayDTO);
        if (gatewayDTO.getId() == null) {
            return createGateway(gatewayDTO);
        }
        Gateway gateway = gatewayMapper.toEntity(gatewayDTO);
        gateway = gatewayRepository.save(gateway);
        GatewayDTO result = gatewayMapper.toDto(gateway);
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
    @Timed
    public List<GatewayDTO> getAllGateways() {
        log.debug("REST request to get all Gateways");
        List<Gateway> gateways = gatewayRepository.findAll();
        return gatewayMapper.toDto(gateways);
        }

    /**
     * GET  /gateways/:id : get the "id" gateway.
     *
     * @param id the id of the gatewayDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the gatewayDTO, or with status 404 (Not Found)
     */
    @GetMapping("/gateways/{id}")
    @Timed
    public ResponseEntity<GatewayDTO> getGateway(@PathVariable Long id) {
        log.debug("REST request to get Gateway : {}", id);
        Gateway gateway = gatewayRepository.findOne(id);
        GatewayDTO gatewayDTO = gatewayMapper.toDto(gateway);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(gatewayDTO));
    }

    /**
     * DELETE  /gateways/:id : delete the "id" gateway.
     *
     * @param id the id of the gatewayDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/gateways/{id}")
    @Timed
    public ResponseEntity<Void> deleteGateway(@PathVariable Long id) {
        log.debug("REST request to delete Gateway : {}", id);
        gatewayRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
}
