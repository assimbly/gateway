package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.FlowDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Flow} and its DTO {@link FlowDTO}.
 */
@Mapper(componentModel = "spring", uses = {IntegrationMapper.class, StepMapper.class})
public interface FlowMapper extends EntityMapper<FlowDTO, Flow> {

    @Mapping(source = "integration.id", target = "integrationId")
    FlowDTO toDto(Flow flow);

    @Mapping(target = "steps", ignore = true)
	@Mapping(target = "removeStep", ignore = true)
	@Mapping(source = "integrationId", target = "integration")
    Flow toEntity(FlowDTO flowDTO);

    default Flow fromId(Long id) {
        if (id == null) {
            return null;
        }
        Flow flow = new Flow();
        flow.setId(id);
        return flow;
    }
}
