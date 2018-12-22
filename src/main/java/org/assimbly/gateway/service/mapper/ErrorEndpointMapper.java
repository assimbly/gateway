package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.ErrorEndpointDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ErrorEndpoint and its DTO ErrorEndpointDTO.
 */
@Mapper(componentModel = "spring", uses = {ServiceMapper.class, HeaderMapper.class})
public interface ErrorEndpointMapper extends EntityMapper<ErrorEndpointDTO, ErrorEndpoint> {

    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "header.id", target = "headerId")
    ErrorEndpointDTO toDto(ErrorEndpoint errorEndpoint);

    @Mapping(source = "serviceId", target = "service")
    @Mapping(source = "headerId", target = "header")
    ErrorEndpoint toEntity(ErrorEndpointDTO errorEndpointDTO);

    default ErrorEndpoint fromId(Long id) {
        if (id == null) {
            return null;
        }
        ErrorEndpoint errorEndpoint = new ErrorEndpoint();
        errorEndpoint.setId(id);
        return errorEndpoint;
    }
}
