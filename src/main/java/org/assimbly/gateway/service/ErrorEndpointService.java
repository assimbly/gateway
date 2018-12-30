package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.ErrorEndpointDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing ErrorEndpoint.
 */
public interface ErrorEndpointService {

    /**
     * Save a errorEndpoint.
     *
     * @param errorEndpointDTO the entity to save
     * @return the persisted entity
     */
    ErrorEndpointDTO save(ErrorEndpointDTO errorEndpointDTO);

    /**
     * Get all the errorEndpoints.
     *
     * @return the list of entities
     */
    List<ErrorEndpointDTO> findAll();


    /**
     * Get the "id" errorEndpoint.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<ErrorEndpointDTO> findOne(Long id);

    /**
     * Delete the "id" errorEndpoint.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
