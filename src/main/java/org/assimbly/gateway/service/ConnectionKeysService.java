package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.ConnectionKeysDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing ConnectionKeys.
 */
public interface ConnectionKeysService {

    /**
     * Save a connectionKeys.
     *
     * @param connectionKeysDTO the entity to save
     * @return the persisted entity
     */
    ConnectionKeysDTO save(ConnectionKeysDTO connectionKeysDTO);

    /**
     * Get all the connectionKeys.
     *
     * @return the list of entities
     */
    List<ConnectionKeysDTO> findAll();


    /**
     * Get the "id" connectionKeys.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<ConnectionKeysDTO> findOne(Long id);

    /**
     * Delete the "id" connectionKeys.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
