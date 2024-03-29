package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.GroupDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Group and its DTO GroupDTO.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class},unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GroupMapper extends EntityMapper<GroupDTO, Group> {


    Group toEntity(GroupDTO groupDTO);

    default Group fromId(Long id) {
        if (id == null) {
            return null;
        }
        Group group = new Group();
        group.setId(id);
        return group;
    }
}
