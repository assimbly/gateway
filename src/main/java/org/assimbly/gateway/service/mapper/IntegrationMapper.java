package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.IntegrationDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Integration and its DTO IntegrationDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface IntegrationMapper extends EntityMapper<IntegrationDTO, Integration> {

    IntegrationDTO toDto(Integration integration);

	@Mapping(target = "flows", ignore = true)
	@Mapping(target = "removeFlow", ignore = true)
	@Mapping(target = "environmentVariables", ignore = true)
	@Mapping(target = "removeEnvironmentVariables", ignore = true)
    Integration toEntity(IntegrationDTO integrationDTO);

    default Integration fromId(Long id) {
        if (id == null) {
            return null;
        }
        Integration integration = new Integration();
        integration.setId(id);
        return integration;
    }
}
