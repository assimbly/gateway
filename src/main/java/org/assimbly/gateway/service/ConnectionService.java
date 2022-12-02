package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.ConnectionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Connection.
 */
public interface ConnectionService {

    /**
     * Save a connection.
     *
     * @param connectionDTO the entity to save
     * @return the persisted entity
     */
    ConnectionDTO save(ConnectionDTO connectionDTO);

    /**
     * Get all the connections.
     *
     * @return the list of entities
     */
    Page<ConnectionDTO> findAll(Pageable pageable);

    /**
     * Get all the connections.
     *
     * @return the list of entities
     */
    List<ConnectionDTO> getAll();

    /**
     * Get the "id" connection.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<ConnectionDTO> findOne(Long id);

    /**
     * Delete the "id" connection.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
