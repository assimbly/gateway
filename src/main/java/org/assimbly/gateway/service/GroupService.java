package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.GroupDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Group.
 */
public interface GroupService {

    /**
     * Save a group.
     *
     * @param groupDTO the entity to save
     * @return the persisted entity
     */
    GroupDTO save(GroupDTO groupDTO);

    /**
     * Get all the groups.
     *
     * @return the list of entities
     */
    List<GroupDTO> findAll();

    /**
     * Get all the Group with eager load of many-to-many relationships.
     *
     * @return the list of entities
     */
    Page<GroupDTO> findAllWithEagerRelationships(Pageable pageable);
    
    /**
     * Get the "id" group.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<GroupDTO> findOne(Long id);

    /**
     * Delete the "id" group.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
