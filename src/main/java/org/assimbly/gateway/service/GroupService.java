package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.GroupDTO;
import java.util.List;

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
     * Get the "id" group.
     *
     * @param id the id of the entity
     * @return the entity
     */
    GroupDTO findOne(Long id);

    /**
     * Delete the "id" group.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
