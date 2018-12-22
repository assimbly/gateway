package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.MaintenanceDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Maintenance.
 */
public interface MaintenanceService {

    /**
     * Save a maintenance.
     *
     * @param maintenanceDTO the entity to save
     * @return the persisted entity
     */
    MaintenanceDTO save(MaintenanceDTO maintenanceDTO);

    /**
     * Get all the maintenances.
     *
     * @return the list of entities
     */
    List<MaintenanceDTO> findAll();


    /**
     * Get the "id" maintenance.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<MaintenanceDTO> findOne(Long id);

    /**
     * Delete the "id" maintenance.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
