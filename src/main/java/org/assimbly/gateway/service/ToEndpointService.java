package org.assimbly.gateway.service;

import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.service.dto.ToEndpointDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing ToEndpoint.
 */
public interface ToEndpointService {

    /**
     * Save a toEndpoint.
     *
     * @param toEndpointDTO the entity to save
     * @return the persisted entity
     */
    ToEndpointDTO save(ToEndpointDTO toEndpointDTO);

    /**
     * Get all the toEndpoints.
     *
     * @return the list of entities
     */
    List<ToEndpointDTO> findAll();


    /**
     * Get the "id" toEndpoint.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<ToEndpointDTO> findOne(Long id);

    /**
     * Get the toEndpoint by flowId.
     *
     * @param id the id of the flow entity
     * @return the entity
     */
	List<ToEndpoint> findByFlowId(Long id);
	
    /**
     * Delete the "id" toEndpoint.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

}
