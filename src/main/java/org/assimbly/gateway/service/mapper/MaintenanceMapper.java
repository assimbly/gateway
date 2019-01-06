package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.MaintenanceDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Maintenance and its DTO MaintenanceDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface MaintenanceMapper extends EntityMapper<MaintenanceDTO, Maintenance> {

    default Maintenance fromId(Long id) {
        if (id == null) {
            return null;
        }
        Maintenance maintenance = new Maintenance();
        maintenance.setId(id);
        return maintenance;
    }
}