package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.CamelRouteDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity CamelRoute and its DTO CamelRouteDTO.
 */
@Mapper(componentModel = "spring", uses = {GatewayMapper.class, FromEndpointMapper.class, ErrorEndpointMapper.class})
public interface CamelRouteMapper extends EntityMapper<CamelRouteDTO, CamelRoute> {

    @Mapping(source = "gateway.id", target = "gatewayId")
    @Mapping(source = "fromEndpoint.id", target = "fromEndpointId")
    @Mapping(source = "errorEndpoint.id", target = "errorEndpointId")
    CamelRouteDTO toDto(CamelRoute camelRoute);

    @Mapping(source = "gatewayId", target = "gateway")
    @Mapping(source = "fromEndpointId", target = "fromEndpoint")
    @Mapping(source = "errorEndpointId", target = "errorEndpoint")
    @Mapping(target = "toEndpoints", ignore = true)
    CamelRoute toEntity(CamelRouteDTO camelRouteDTO);

    default CamelRoute fromId(Long id) {
        if (id == null) {
            return null;
        }
        CamelRoute camelRoute = new CamelRoute();
        camelRoute.setId(id);
        return camelRoute;
    }
}
