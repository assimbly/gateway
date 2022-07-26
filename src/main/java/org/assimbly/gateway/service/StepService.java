package org.assimbly.gateway.service;

import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.service.dto.StepDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Step.
 */
public interface StepService {

    /**
     * Save a step.
     *
     * @param stepDTO the entity to save
     * @return the persisted entity
     */
    StepDTO save(StepDTO stepDTO);

    /**
     * Get all the steps.
     *
     * @return the list of entities
     */
    List<StepDTO> findAll();


    /**
     * Get the "id" step.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<StepDTO> findOne(Long id);

    /**
     * Get the step by flowId.
     *
     * @param id the id of the flow entity
     * @return the entity
     */
	List<Step> findByFlowId(Long id);

    /**
     * Delete the "id" step.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

}
