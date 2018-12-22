package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.ServiceKeysDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ServiceKeys and its DTO ServiceKeysDTO.
 */
@Mapper(componentModel = "spring", uses = {ServiceMapper.class})
public interface ServiceKeysMapper extends EntityMapper<ServiceKeysDTO, ServiceKeys> {

    @Mapping(source = "serviceKeys.id", target = "serviceKeysId")
    ServiceKeysDTO toDto(ServiceKeys serviceKeys);

    @Mapping(source = "serviceKeysId", target = "serviceKeys")
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
