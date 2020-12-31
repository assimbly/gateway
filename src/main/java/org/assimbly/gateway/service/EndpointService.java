package org.assimbly.gateway.service;

import org.assimbly.gateway.domain.Endpoint;
import org.assimbly.gateway.service.dto.EndpointDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Endpoint.
 */
public interface EndpointService {

    /**
     * Save a endpoint.
     *
     * @param endpointDTO the entity to save
     * @return the persisted entity
     */
    EndpointDTO save(EndpointDTO endpointDTO);

    /**
     * Get all the endpoints.
     *
     * @return the list of entities
     */
    List<EndpointDTO> findAll();


    /**
     * Get the "id" endpoint.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<EndpointDTO> findOne(Long id);

    /**
     * Get the endpoint by flowId.
     *
     * @param id the id of the flow entity
     * @return the entity
     */
	List<Endpoint> findByFlowId(Long id);
	
    /**
     * Delete the "id" endpoint.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

}
