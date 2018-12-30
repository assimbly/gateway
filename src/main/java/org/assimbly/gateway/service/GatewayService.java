package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.GatewayDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Gateway.
 */
public interface GatewayService {

    /**
     * Save a gateway.
     *
     * @param gatewayDTO the entity to save
     * @return the persisted entity
     */
    GatewayDTO save(GatewayDTO gatewayDTO);

    /**
     * Get all the gateways.
     *
     * @return the list of entities
     */
    List<GatewayDTO> findAll();


    /**
     * Get the "id" gateway.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<GatewayDTO> findOne(Long id);

    /**
     * Delete the "id" gateway.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
