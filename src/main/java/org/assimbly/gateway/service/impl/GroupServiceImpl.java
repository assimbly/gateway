package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.GroupService;
import org.assimbly.gateway.domain.Group;
import org.assimbly.gateway.repository.GroupRepository;
import org.assimbly.gateway.service.dto.GroupDTO;
import org.assimbly.gateway.service.mapper.GroupMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Group.
 */
@Service
@Transactional
public class GroupServiceImpl implements GroupService {

    private final Logger log = LoggerFactory.getLogger(GroupServiceImpl.class);

    private final GroupRepository groupRepository;

    private final GroupMapper groupMapper;

    public GroupServiceImpl(GroupRepository groupRepository, GroupMapper groupMapper) {
        this.groupRepository = groupRepository;
        this.groupMapper = groupMapper;
    }

    /**
     * Save a group.
     *
     * @param groupDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public GroupDTO save(GroupDTO groupDTO) {
        log.debug("Request to save Group : {}", groupDTO);

        Group group = groupMapper.toEntity(groupDTO);
        group = groupRepository.save(group);
        return groupMapper.toDto(group);
    }

    /**
     * Get all the groups.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<GroupDTO> findAll() {
        log.debug("Request to get all Groups");
        return groupRepository.findAllWithEagerRelationships().stream()
            .map(groupMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get all the Group with eager load of many-to-many relationships.
     *
     * @return the list of entities
     */
    public Page<GroupDTO> findAllWithEagerRelationships(Pageable pageable) {
        return groupRepository.findAllWithEagerRelationships(pageable).map(groupMapper::toDto);
    }
    

    /**
     * Get one group by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<GroupDTO> findOne(Long id) {
        log.debug("Request to get Group : {}", id);
        return groupRepository.findOneWithEagerRelationships(id)
            .map(groupMapper::toDto);
    }

    /**
     * Delete the group by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Group : {}", id);
        groupRepository.deleteById(id);
    }
}
