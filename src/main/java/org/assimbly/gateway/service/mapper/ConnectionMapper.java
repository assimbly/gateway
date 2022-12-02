package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.ConnectionDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Connection and its DTO ConnectionDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface ConnectionMapper extends EntityMapper<ConnectionDTO, Connection> {

	@Mapping(target = "connectionKeys", ignore = true)
	@Mapping(target = "removeConnectionKeys", ignore = true)
    Connection toEntity(ConnectionDTO connectionDTO);

    default Connection fromId(Long id) {
        if (id == null) {
            return null;
        }
        Connection connection = new Connection();
        connection.setId(id);
        return connection;
    }
}

