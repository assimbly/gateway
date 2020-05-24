package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.GatewayDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Gateway and its DTO GatewayDTO.
 */
@Mapper(componentModel = "spring", uses = {WireTapEndpointMapper.class})
public interface GatewayMapper extends EntityMapper<GatewayDTO, Gateway> {

    @Mapping(source = "wiretapEndpoint.id", target = "wiretapEndpointId")
    GatewayDTO toDto(Gateway gateway);

    @Mapping(source = "wiretapEndpointId", target = "wiretapEndpoint")
    @Mapping(target = "flows", ignore = true)
    @Mapping(target = "removeFlow", ignore = true)
    @Mapping(target = "environmentVariables", ignore = true)
    @Mapping(target = "removeEnvironmentVariables", ignore = true)
    Gateway toEntity(GatewayDTO gatewayDTO);

    default Gateway fromId(Long id) {
        if (id == null) {
            return null;
        }
        Gateway gateway = new Gateway();
        gateway.setId(id);
        return gateway;
    }
}
