package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.ServiceKeysDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ServiceKeys and its DTO ServiceKeysDTO.
 */
@Mapper(componentModel = "spring", uses = {ServiceMapper.class})
public interface ServiceKeysMapper extends EntityMapper<ServiceKeysDTO, ServiceKeys> {

    @Mapping(source = "service.id", target = "serviceId")
    ServiceKeysDTO toDto(ServiceKeys serviceKeys);

    @Mapping(source = "serviceId", target = "service")
    ServiceKeys toEntity(ServiceKeysDTO serviceKeysDTO);

    default ServiceKeys fromId(Long id) {
        if (id == null) {
            return null;
        }
        ServiceKeys serviceKeys = new ServiceKeys();
        serviceKeys.setId(id);
        return serviceKeys;
    }
}
