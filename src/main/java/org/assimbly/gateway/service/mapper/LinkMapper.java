package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.Link;
import org.assimbly.gateway.service.dto.HeaderKeysDTO;
import org.assimbly.gateway.service.dto.LinkDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper for the entity Link and its DTO LinkDTO.
 */
@Mapper(componentModel = "spring", uses = {StepMapper.class})
public interface LinkMapper extends EntityMapper<LinkDTO, Link> {

    @Mapping(source = "step.id", target = "stepId")
    LinkDTO toDto(Link link);

    @Mapping(source = "stepId", target = "step")
    Link toEntity(LinkDTO linkDTO);

    default Link fromId(Long id) {
        if (id == null) {
            return null;
        }
        Link link = new Link();
        link.setId(id);
        return link;
    }

}
