package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.HeaderDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Header and its DTO HeaderDTO.
 */
@Mapper(componentModel = "spring", uses = {MessageMapper.class})
public interface HeaderMapper extends EntityMapper<HeaderDTO, Header> {

    @Mapping(source = "message.id", target = "messageId")
    HeaderDTO toDto(Header header);

    @Mapping(source = "messageId", target = "message")
    Header toEntity(HeaderDTO headerDTO);

    default Header fromId(Long id) {
        if (id == null) {
            return null;
        }
        Header header = new Header();
        header.setId(id);
        return header;
    }
}
