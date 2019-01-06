package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.HeaderKeysDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing HeaderKeys.
 */
public interface HeaderKeysService {

    /**
     * Save a headerKeys.
     *
     * @param headerKeysDTO the entity to save
     * @return the persisted entity
     */
    HeaderKeysDTO save(HeaderKeysDTO headerKeysDTO);

    /**
     * Get all the headerKeys.
     *
     * @return the list of entities
     */
    List<HeaderKeysDTO> findAll();


    /**
     * Get the "id" headerKeys.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<HeaderKeysDTO> findOne(Long id);

    /**
     * Delete the "id" headerKeys.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
