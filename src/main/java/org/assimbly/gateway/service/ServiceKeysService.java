package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.ServiceKeysDTO;
import java.util.List;

/**
 * Service Interface for managing ServiceKeys.
 */
public interface ServiceKeysService {

    /**
     * Save a serviceKeys.
     *
     * @param serviceKeysDTO the entity to save
     * @return the persisted entity
     */
    ServiceKeysDTO save(ServiceKeysDTO serviceKeysDTO);

    /**
     * Get all the serviceKeys.
     *
     * @return the list of entities
     */
    List<ServiceKeysDTO> findAll();

    /**
     * Get the "id" serviceKeys.
     *
     * @param id the id of the entity
     * @return the entity
     */
    ServiceKeysDTO findOne(Long id);

    /**
     * Delete the "id" serviceKeys.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
