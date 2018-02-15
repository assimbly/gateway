package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.ToEndpointDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ToEndpoint and its DTO ToEndpointDTO.
 */
@Mapper(componentModel = "spring", uses = {CamelRouteMapper.class, ServiceMapper.class, HeaderMapper.class})
public interface ToEndpointMapper extends EntityMapper<ToEndpointDTO, ToEndpoint> {

    @Mapping(source = "camelRoute.id", target = "camelRouteId")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "header.id", target = "headerId")
    ToEndpointDTO toDto(ToEndpoint toEndpoint);

    @Mapping(source = "camelRouteId", target = "camelRoute")
    @Mapping(source = "serviceId", target = "service")
    @Mapping(source = "headerId", target = "header")
    ToEndpoint toEntity(ToEndpointDTO toEndpointDTO);

    default ToEndpoint fromId(Long id) {
        if (id == null) {
            return null;
        }
        ToEndpoint toEndpoint = new ToEndpoint();
        toEndpoint.setId(id);
        return toEndpoint;
    }
}
