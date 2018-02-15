package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.FromEndpointDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity FromEndpoint and its DTO FromEndpointDTO.
 */
@Mapper(componentModel = "spring", uses = {ServiceMapper.class, HeaderMapper.class})
public interface FromEndpointMapper extends EntityMapper<FromEndpointDTO, FromEndpoint> {

    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "header.id", target = "headerId")
    FromEndpointDTO toDto(FromEndpoint fromEndpoint);

    @Mapping(source = "serviceId", target = "service")
    @Mapping(source = "headerId", target = "header")
    FromEndpoint toEntity(FromEndpointDTO fromEndpointDTO);

    default FromEndpoint fromId(Long id) {
        if (id == null) {
            return null;
        }
        FromEndpoint fromEndpoint = new FromEndpoint();
        fromEndpoint.setId(id);
        return fromEndpoint;
    }
}
