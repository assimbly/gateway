package org.assimbly.gateway.web.rest.connector;

import org.assimbly.gateway.service.MaintenanceService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.MaintenanceDTO;
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
 * REST controller for managing Maintenance.
 */
@RestController
@RequestMapping("/api")
public class MaintenanceResource {

    private final Logger log = LoggerFactory.getLogger(MaintenanceResource.class);

    private static final String ENTITY_NAME = "maintenance";

    private final MaintenanceService maintenanceService;

    public MaintenanceResource(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    /**
     * POST  /maintenances : Create a new maintenance.
     *
     * @param maintenanceDTO the maintenanceDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new maintenanceDTO, or with status 400 (Bad Request) if the maintenance has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/maintenances")
    public ResponseEntity<MaintenanceDTO> createMaintenance(@RequestBody MaintenanceDTO maintenanceDTO) throws URISyntaxException {
        log.debug("REST request to save Maintenance : {}", maintenanceDTO);
        if (maintenanceDTO.getId() != null) {
            throw new BadRequestAlertException("A new maintenance cannot already have an ID", ENTITY_NAME, "idexists");
        }
        MaintenanceDTO result = maintenanceService.save(maintenanceDTO);
        return ResponseEntity.created(new URI("/api/maintenances/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /maintenances : Updates an existing maintenance.
     *
     * @param maintenanceDTO the maintenanceDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated maintenanceDTO,
     * or with status 400 (Bad Request) if the maintenanceDTO is not valid,
     * or with status 500 (Internal Server Error) if the maintenanceDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/maintenances")
    public ResponseEntity<MaintenanceDTO> updateMaintenance(@RequestBody MaintenanceDTO maintenanceDTO) throws URISyntaxException {
        log.debug("REST request to update Maintenance : {}", maintenanceDTO);
        if (maintenanceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        MaintenanceDTO result = maintenanceService.save(maintenanceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, maintenanceDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /maintenances : get all the maintenances.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of maintenances in body
     */
    @GetMapping("/maintenances")
    public List<MaintenanceDTO> getAllMaintenances() {
        log.debug("REST request to get all Maintenances");
        return maintenanceService.findAll();
    }

    /**
     * GET  /maintenances/:id : get the "id" maintenance.
     *
     * @param id the id of the maintenanceDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the maintenanceDTO, or with status 404 (Not Found)
     */
    @GetMapping("/maintenances/{id}")
    public ResponseEntity<MaintenanceDTO> getMaintenance(@PathVariable Long id) {
        log.debug("REST request to get Maintenance : {}", id);
        Optional<MaintenanceDTO> maintenanceDTO = maintenanceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(maintenanceDTO);
    }

    /**
     * DELETE  /maintenances/:id : delete the "id" maintenance.
     *
     * @param id the id of the maintenanceDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/maintenances/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable Long id) {
        log.debug("REST request to delete Maintenance : {}", id);
        maintenanceService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
