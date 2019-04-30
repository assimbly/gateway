package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.SecurityDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Security and its DTO SecurityDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface SecurityTLSMapper extends EntityMapper<SecurityDTO, org.assimbly.gateway.domain.Security> {

    default Security fromId(Long id) {
        if (id == null) {
            return null;
        }
        org.assimbly.gateway.domain.Security security = new org.assimbly.gateway.domain.Security();
        security.setId(id);
        return security;
    }
}
