package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.assimbly.gateway.domain.ServiceKeys;

import org.assimbly.gateway.repository.ServiceKeysRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.ServiceKeysService;
import org.assimbly.gateway.service.dto.ServiceKeysDTO;
import org.assimbly.gateway.service.mapper.ServiceKeysMapper;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing ServiceKeys.
 */
@RestController
@RequestMapping("/api")
public class ServiceKeysResource {

    private final Logger log = LoggerFactory.getLogger(ServiceKeysResource.class);

    private static final String ENTITY_NAME = "serviceKeys";

    private final ServiceKeysRepository serviceKeysRepository;

    private final ServiceKeysMapper serviceKeysMapper;

	private JpaRepository<ServiceKeys, Long> serviceKeysService;

    public ServiceKeysResource(ServiceKeysRepository serviceKeysRepository, ServiceKeysMapper serviceKeysMapper) {
        this.serviceKeysRepository = serviceKeysRepository;
        this.serviceKeysMapper = serviceKeysMapper;
    }

    /**
     * POST  /service-keys : Create a new serviceKeys.
     *
     * @param serviceKeysDTO the serviceKeysDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new serviceKeysDTO, or with status 400 (Bad Request) if the serviceKeys has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/service-keys")
    @Timed
    public ResponseEntity<ServiceKeysDTO> createServiceKeys(@RequestBody ServiceKeysDTO serviceKeysDTO) throws URISyntaxException {
        log.debug("REST request to save ServiceKeys : {}", serviceKeysDTO);
        if (serviceKeysDTO.getId() != null) {
            throw new BadRequestAlertException("A new serviceKeys cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ServiceKeys serviceKeys = serviceKeysMapper.toEntity(serviceKeysDTO);
        serviceKeys = serviceKeysRepository.save(serviceKeys);
        ServiceKeysDTO result = serviceKeysMapper.toDto(serviceKeys);
        return ResponseEntity.created(new URI("/api/service-keys/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /service-keys : Updates an existing serviceKeys.
     *
     * @param serviceKeysDTO the serviceKeysDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated serviceKeysDTO,
     * or with status 400 (Bad Request) if the serviceKeysDTO is not valid,
     * or with status 500 (Internal Server Error) if the serviceKeysDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/service-keys")
    @Timed
    public ResponseEntity<ServiceKeysDTO> updateServiceKeys(@RequestBody ServiceKeysDTO serviceKeysDTO) throws URISyntaxException {
        log.debug("REST request to update ServiceKeys : {}", serviceKeysDTO);
        if (serviceKeysDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ServiceKeys serviceKeys = serviceKeysMapper.toEntity(serviceKeysDTO);
        serviceKeys = serviceKeysRepository.save(serviceKeys);
        ServiceKeysDTO result = serviceKeysMapper.toDto(serviceKeys);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, serviceKeysDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /service-keys : get all the serviceKeys.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of serviceKeys in body
     */
    @GetMapping("/service-keys")
    @Timed
    public List<ServiceKeys> getAllServiceKeys() {
        log.debug("REST request to get all ServiceKeys");
        return serviceKeysService.findAll();
    }

    /**
     * GET  /service-keys/:id : get the "id" serviceKeys.
     *
     * @param id the id of the serviceKeysDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the serviceKeysDTO, or with status 404 (Not Found)
     */
    @GetMapping("/service-keys/{id}")
    @Timed
    public ResponseEntity<ServiceKeys> getServiceKeys(@PathVariable Long id) {
        log.debug("REST request to get ServiceKeys : {}", id);
        Optional<ServiceKeys> serviceKeysDTO = serviceKeysService.findById(id);
        return ResponseUtil.wrapOrNotFound(serviceKeysDTO);
    }

    /**
     * DELETE  /service-keys/:id : delete the "id" serviceKeys.
     *
     * @param id the id of the serviceKeysDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/service-keys/{id}")
    @Timed
    public ResponseEntity<Void> deleteServiceKeys(@PathVariable Long id) {
        log.debug("REST request to delete ServiceKeys : {}", id);
        serviceKeysRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}