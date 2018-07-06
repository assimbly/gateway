package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.FlowDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Flow and its DTO FlowDTO.
 */
@Mapper(componentModel = "spring", uses = {GatewayMapper.class, FromEndpointMapper.class, ErrorEndpointMapper.class, MaintenanceMapper.class})
public interface FlowMapper extends EntityMapper<FlowDTO, Flow> {

    @Mapping(source = "gateway.id", target = "gatewayId")
    @Mapping(source = "fromEndpoint.id", target = "fromEndpointId")
    @Mapping(source = "errorEndpoint.id", target = "errorEndpointId")
    @Mapping(source = "maintenance.id", target = "maintenanceId")
    FlowDTO toDto(Flow flow);

    @Mapping(source = "gatewayId", target = "gateway")
    @Mapping(source = "fromEndpointId", target = "fromEndpoint")
    @Mapping(source = "errorEndpointId", target = "errorEndpoint")
    @Mapping(source = "maintenanceId", target = "maintenance")    
    @Mapping(target = "toEndpoints", ignore = true)
    Flow toEntity(FlowDTO flowDTO);

    default Flow fromId(Long id) {
        if (id == null) {
            return null;
        }
        Flow flow = new Flow();
        flow.setId(id);
        return flow;
    }
}
