package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.HeaderKeysDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity HeaderKeys and its DTO HeaderKeysDTO.
 */
@Mapper(componentModel = "spring", uses = {HeaderMapper.class})
public interface HeaderKeysMapper extends EntityMapper<HeaderKeysDTO, HeaderKeys> {

    @Mapping(source = "header.id", target = "headerId")
    HeaderKeysDTO toDto(HeaderKeys headerKeys);

    @Mapping(source = "headerId", target = "header")
    HeaderKeys toEntity(HeaderKeysDTO headerKeysDTO);

    default HeaderKeys fromId(Long id) {
        if (id == null) {
            return null;
        }
        HeaderKeys headerKeys = new HeaderKeys();
        headerKeys.setId(id);
        return headerKeys;
    }
}
