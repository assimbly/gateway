package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.StepDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Step and its DTO StepDTO.
 */
@Mapper(componentModel = "spring", uses = {ServiceMapper.class, HeaderMapper.class, FlowMapper.class})
public interface StepMapper extends EntityMapper<StepDTO, Step> {

	@Mapping(source = "service.id", target = "serviceId")
	@Mapping(source = "header.id", target = "headerId")
	@Mapping(source = "flow.id", target = "flowId")
    StepDTO toDto(Step step);

	@Mapping(source = "serviceId", target = "service")
	@Mapping(source = "headerId", target = "header")
	@Mapping(source = "flowId", target = "flow")
    Step toEntity(StepDTO stepDTO);

    default Step fromId(Long id) {
        if (id == null) {
            return null;
        }
        Step step = new Step();
        step.setId(id);
        return step;
    }
}
