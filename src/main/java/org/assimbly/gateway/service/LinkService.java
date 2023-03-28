package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.LinkDTO;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Service Interface for managing Link.
 */
public interface LinkService {

    /**
     * Save a link.
     *
     * @param linkDTO the entity to save
     * @return the persisted entity
     */
    LinkDTO save(LinkDTO linkDTO);

    /**
     * Get all the link.
     *
     * @return the list of entities
     */
    List<LinkDTO> findAll();


    /**
     * Get the "id" link.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<LinkDTO> findOne(Long id);

    /**
     * Delete the "id" link.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

    /**
     * Delete the "stepId" link.
     *
     * @param stepId the stepId of the entity
     */
    void deleteByStepId(Long stepId);

    /**
     * Get the "name" link.
     *
     * @param name the name of the entity
     * @return the entity
     */
    Optional<Set<LinkDTO>> findByName(String name);

}
