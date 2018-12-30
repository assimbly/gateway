package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.EnvironmentVariablesDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing EnvironmentVariables.
 */
public interface EnvironmentVariablesService {

    /**
     * Save a environmentVariables.
     *
     * @param environmentVariablesDTO the entity to save
     * @return the persisted entity
     */
    EnvironmentVariablesDTO save(EnvironmentVariablesDTO environmentVariablesDTO);

    /**
     * Get all the environmentVariables.
     *
     * @return the list of entities
     */
    List<EnvironmentVariablesDTO> findAll();


    /**
     * Get the "id" environmentVariables.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<EnvironmentVariablesDTO> findOne(Long id);

    /**
     * Delete the "id" environmentVariables.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
