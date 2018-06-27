package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.assimbly.gateway.domain.Group;
import org.assimbly.gateway.repository.GroupRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.GroupDTO;
import org.assimbly.gateway.service.mapper.GroupMapper;

import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Group.
 */
@RestController
@RequestMapping("/api")
public class GroupResource {

    private final Logger log = LoggerFactory.getLogger(GroupResource.class);

    private static final String ENTITY_NAME = "group";

    private final GroupRepository groupRepository;

    private final GroupMapper groupMapper;
    
    public GroupResource(GroupRepository groupRepository, GroupMapper groupMapper) {
        this.groupRepository = groupRepository;
        this.groupMapper = groupMapper;
    }

    /**
     * POST  /groups : Create a new group.
     *
     * @param groupDTO the groupDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new groupDTO, or with status 400 (Bad Request) if the group has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/groups")
    @Timed
    public ResponseEntity<GroupDTO> createGroup(@RequestBody GroupDTO groupDTO) throws URISyntaxException {
        log.debug("REST request to save Group : {}", groupDTO);
        if (groupDTO.getId() != null) {
            throw new BadRequestAlertException("A new group cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Group group = groupMapper.toEntity(groupDTO);
        group = groupRepository.save(group);
        GroupDTO result = groupMapper.toDto(group);
        return ResponseEntity.created(new URI("/api/groups/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /groups : Updates an existing group.
     *
     * @param groupDTO the groupDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated groupDTO,
     * or with status 400 (Bad Request) if the groupDTO is not valid,
     * or with status 500 (Internal Server Error) if the groupDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/groups")
    @Timed
    public ResponseEntity<GroupDTO> updateGroup(@RequestBody GroupDTO groupDTO) throws URISyntaxException {
        log.debug("REST request to update Group : {}", groupDTO);
        if (groupDTO.getId() == null) {
            return createGroup(groupDTO);
        }

        Group group = groupMapper.toEntity(groupDTO);
        group = groupRepository.save(group);
        GroupDTO result = groupMapper.toDto(group);
        
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, groupDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /groups : get all the groups.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of groups in body
     */
    @GetMapping("/groups")
    @Timed
    public List<GroupDTO> getAllGroups() {
        log.debug("REST request to get all Groups");
        List<Group> groups = groupRepository.findAll();
        return groupMapper.toDto(groups);
    }

    /**
     * GET  /groups/:id : get the "id" group.
     *
     * @param id the id of the groupDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the groupDTO, or with status 404 (Not Found)
     */
    @GetMapping("/groups/{id}")
    @Timed
    public ResponseEntity<GroupDTO> getGroup(@PathVariable Long id) {
        log.debug("REST request to get Group : {}", id);
        Group group = groupRepository.findOne(id);
        GroupDTO groupDTO = groupMapper.toDto(group);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(groupDTO));

    }

    /**
     * DELETE  /groups/:id : delete the "id" group.
     *
     * @param id the id of the groupDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/groups/{id}")
    @Timed
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        log.debug("REST request to delete Group : {}", id);
        groupRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
