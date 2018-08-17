package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.WireTapEndpointDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity WireTapEndpoint and its DTO WireTapEndpointDTO.
 */
@Mapper(componentModel = "spring", uses = {ServiceMapper.class, HeaderMapper.class})
public interface WireTapEndpointMapper extends EntityMapper<WireTapEndpointDTO, WireTapEndpoint> {

    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "header.id", target = "headerId")
    WireTapEndpointDTO toDto(WireTapEndpoint wireTapEndpoint);

    @Mapping(source = "serviceId", target = "service")
    @Mapping(source = "headerId", target = "header")
    WireTapEndpoint toEntity(WireTapEndpointDTO wireTapEndpointDTO);

    default WireTapEndpoint wireTapId(Long id) {
        if (id == null) {
            return null;
        }
        WireTapEndpoint wireTapEndpoint = new WireTapEndpoint();
        wireTapEndpoint.setId(id);
        return wireTapEndpoint;
    }
}
