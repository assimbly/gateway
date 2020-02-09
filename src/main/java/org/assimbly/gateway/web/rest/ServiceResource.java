package org.assimbly.gateway.web.rest;


import org.assimbly.gateway.service.ServiceService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.service.dto.HeaderDTO;
import org.assimbly.gateway.service.dto.ServiceDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Service.
 */
@RestController
@RequestMapping("/api")
public class ServiceResource {

    private final Logger log = LoggerFactory.getLogger(ServiceResource.class);

    private static final String ENTITY_NAME = "service";

    private final ServiceService serviceService;

    public ServiceResource(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    /**
     * POST  /services : Create a new service.
     *
     * @param serviceDTO the serviceDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new serviceDTO, or with status 400 (Bad Request) if the service has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/services")
    
    public ResponseEntity<ServiceDTO> createService(@RequestBody ServiceDTO serviceDTO) throws URISyntaxException {
        log.debug("REST request to save Service : {}", serviceDTO);
        if (serviceDTO.getId() != null) {
            throw new BadRequestAlertException("A new service cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ServiceDTO result = serviceService.save(serviceDTO);
        return ResponseEntity.created(new URI("/api/services/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /services : Updates an existing service.
     *
     * @param serviceDTO the serviceDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated serviceDTO,
     * or with status 400 (Bad Request) if the serviceDTO is not valid,
     * or with status 500 (Internal Server Error) if the serviceDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/services")
    
    public ResponseEntity<ServiceDTO> updateService(@RequestBody ServiceDTO serviceDTO) throws URISyntaxException {
        log.debug("REST request to update Service : {}", serviceDTO);
        if (serviceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ServiceDTO result = serviceService.save(serviceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, serviceDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /services : get all the services.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of services in body
     */
    @GetMapping("/services")
    
    public ResponseEntity<List<ServiceDTO>> getAllServices(Pageable pageable) {
        log.debug("REST request to get all Services");
        Page<ServiceDTO> page = serviceService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/services");
        return ResponseEntity.ok().headers(headers).body(page.getContent());        
    }
    
    @GetMapping("/services/getallservices")
    
    @Transactional(readOnly = true)
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        log.debug("REST request to get all Services 2");
        List<ServiceDTO> servicesList = serviceService.getAll();
        return ResponseEntity.ok().body(servicesList);
    }

    /**
     * GET  /services/:id : get the "id" service.
     *
     * @param id the id of the serviceDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the serviceDTO, or with status 404 (Not Found)
     */
    @GetMapping("/services/{id}")
    
    public ResponseEntity<ServiceDTO> getService(@PathVariable Long id) {
        log.debug("REST request to get Service : {}", id);
        Optional<ServiceDTO> serviceDTO = serviceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(serviceDTO);
    }

    /**
     * DELETE  /services/:id : delete the "id" service.
     *
     * @param id the id of the serviceDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/services/{id}")
    
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        log.debug("REST request to delete Service : {}", id);
        serviceService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
