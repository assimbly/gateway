package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.ServiceDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Service and its DTO ServiceDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface ServiceMapper extends EntityMapper<ServiceDTO, Service> {


    @Mapping(target = "serviceKeys", ignore = true)
    @Mapping(target = "removeServiceKeys", ignore = true)
    Service toEntity(ServiceDTO serviceDTO);

    default Service fromId(Long id) {
        if (id == null) {
            return null;
        }
        Service service = new Service();
        service.setId(id);
        return service;
    }
}

