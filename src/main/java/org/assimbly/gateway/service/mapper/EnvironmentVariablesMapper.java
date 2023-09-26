package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.EnvironmentVariablesDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity EnvironmentVariables and its DTO EnvironmentVariablesDTO.
 */
@Mapper(componentModel = "spring", uses = {IntegrationMapper.class})
public interface EnvironmentVariablesMapper extends EntityMapper<EnvironmentVariablesDTO, EnvironmentVariables> {

    @Mapping(source = "integration.id", target = "integrationId")
    EnvironmentVariablesDTO toDto(EnvironmentVariables environmentVariables);

    @Mapping(source = "integrationId", target = "integration")
    EnvironmentVariables toEntity(EnvironmentVariablesDTO environmentVariablesDTO);

    default EnvironmentVariables fromId(Long id) {
        if (id == null) {
            return null;
        }
        EnvironmentVariables environmentVariables = new EnvironmentVariables();
        environmentVariables.setId(id);
        return environmentVariables;
    }
}
