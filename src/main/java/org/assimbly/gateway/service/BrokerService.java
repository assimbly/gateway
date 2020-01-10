package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.BrokerDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Broker.
 */
public interface BrokerService {

    /**
     * Save a broker.
     *
     * @param brokerDTO the entity to save
     * @return the persisted entity
     */
    BrokerDTO save(BrokerDTO brokerDTO);

    /**
     * Get all the brokers.
     *
     * @return the list of entities
     */
    List<BrokerDTO> findAll();


    /**
     * Get the "id" broker.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<BrokerDTO> findOne(Long id);

    /**
     * Delete the "id" broker.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
