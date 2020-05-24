package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.ToEndpointDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ToEndpoint and its DTO ToEndpointDTO.
 */
@Mapper(componentModel = "spring", uses = {ServiceMapper.class, HeaderMapper.class, FlowMapper.class})
public interface ToEndpointMapper extends EntityMapper<ToEndpointDTO, ToEndpoint> {

    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "header.id", target = "headerId")
    @Mapping(source = "flow.id", target = "flowId")
    ToEndpointDTO toDto(ToEndpoint toEndpoint);

    @Mapping(source = "serviceId", target = "service")
    @Mapping(source = "headerId", target = "header")
    @Mapping(source = "flowId", target = "flow")
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