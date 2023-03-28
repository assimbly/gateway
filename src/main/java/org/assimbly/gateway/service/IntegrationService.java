package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.IntegrationDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Integration.
 */
public interface IntegrationService {

    /**
     * Save a integration.
     *
     * @param integrationDTO the entity to save
     * @return the persisted entity
     */
    IntegrationDTO save(IntegrationDTO integrationDTO);

    /**
     * Get all the integrations.
     *
     * @return the list of entities
     */
    List<IntegrationDTO> findAll();


    /**
     * Get the "id" integration.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<IntegrationDTO> findOne(Long id);

    /**
     * Delete the "id" integration.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
