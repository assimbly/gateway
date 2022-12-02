package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.ConnectionKeysDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ConnectionKeys and its DTO ConnectionKeysDTO.
 */
@Mapper(componentModel = "spring", uses = {ConnectionMapper.class})
public interface ConnectionKeysMapper extends EntityMapper<ConnectionKeysDTO, ConnectionKeys> {

    @Mapping(source = "connection.id", target = "connectionId")
    ConnectionKeysDTO toDto(ConnectionKeys connectionKeys);

    @Mapping(source = "connectionId", target = "connection")
    ConnectionKeys toEntity(ConnectionKeysDTO connectionKeysDTO);

    default ConnectionKeys fromId(Long id) {
        if (id == null) {
            return null;
        }
        ConnectionKeys connectionKeys = new ConnectionKeys();
        connectionKeys.setId(id);
        return connectionKeys;
    }
}
