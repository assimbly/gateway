package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.EnvironmentVariablesDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity EnvironmentVariables and its DTO EnvironmentVariablesDTO.
 */
@Mapper(componentModel = "spring", uses = {GatewayMapper.class})
public interface EnvironmentVariablesMapper extends EntityMapper<EnvironmentVariablesDTO, EnvironmentVariables> {

    @Mapping(source = "gateway.id", target = "gatewayId")
    EnvironmentVariablesDTO toDto(EnvironmentVariables environmentVariables);

    @Mapping(source = "gatewayId", target = "gateway")
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
