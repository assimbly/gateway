package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.StepDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Step and its DTO StepDTO.
 */
@Mapper(componentModel = "spring", uses = {LinkMapper.class, ConnectionMapper.class, MessageMapper.class, FlowMapper.class})
public interface StepMapper extends EntityMapper<StepDTO, Step> {

    @Mapping(source = "connection.id", target = "connectionId")
	@Mapping(source = "message.id", target = "messageId")
	@Mapping(source = "flow.id", target = "flowId")
    StepDTO toDto(Step step);

	@Mapping(source = "flowId", target = "flow")
    @Mapping(target = "links", ignore = true)
    @Mapping(target = "removeLink", ignore = true)
    @Mapping(source = "connectionId", target = "connection")
    @Mapping(source = "messageId", target = "message")
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
