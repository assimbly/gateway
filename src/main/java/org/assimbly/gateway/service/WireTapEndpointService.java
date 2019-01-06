package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.WireTapEndpointDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing WireTapEndpoint.
 */
public interface WireTapEndpointService {

    /**
     * Save a wireTapEndpoint.
     *
     * @param wireTapEndpointDTO the entity to save
     * @return the persisted entity
     */
    WireTapEndpointDTO save(WireTapEndpointDTO wireTapEndpointDTO);

    /**
     * Get all the wireTapEndpoints.
     *
     * @return the list of entities
     */
    List<WireTapEndpointDTO> findAll();


    /**
     * Get the "id" wireTapEndpoint.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<WireTapEndpointDTO> findOne(Long id);

    /**
     * Delete the "id" wireTapEndpoint.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
