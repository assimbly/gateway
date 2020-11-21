package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.EndpointDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Endpoint and its DTO EndpointDTO.
 */
@Mapper(componentModel = "spring", uses = {ServiceMapper.class, HeaderMapper.class, FlowMapper.class})
public interface EndpointMapper extends EntityMapper<EndpointDTO, Endpoint> {

    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "header.id", target = "headerId")
    @Mapping(source = "flow.id", target = "flowId")
    EndpointDTO toDto(Endpoint endpoint);

    @Mapping(source = "serviceId", target = "service")
    @Mapping(source = "headerId", target = "header")
    @Mapping(source = "flowId", target = "flow")
    Endpoint toEntity(EndpointDTO endpointDTO);

    default Endpoint fromId(Long id) {
        if (id == null) {
            return null;
        }
        Endpoint endpoint = new Endpoint();
        endpoint.setId(id);
        return endpoint;
    }
}