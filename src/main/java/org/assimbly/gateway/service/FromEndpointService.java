package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.FromEndpointDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing FromEndpoint.
 */
public interface FromEndpointService {

    /**
     * Save a fromEndpoint.
     *
     * @param fromEndpointDTO the entity to save
     * @return the persisted entity
     */
    FromEndpointDTO save(FromEndpointDTO fromEndpointDTO);

    /**
     * Get all the fromEndpoints.
     *
     * @return the list of entities
     */
    List<FromEndpointDTO> findAll();


    /**
     * Get the "id" fromEndpoint.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<FromEndpointDTO> findOne(Long id);

    /**
     * Delete the "id" fromEndpoint.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
