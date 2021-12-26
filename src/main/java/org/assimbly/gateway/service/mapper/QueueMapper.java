package org.assimbly.gateway.service.mapper;


import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.QueueDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Queue} and its DTO {@link QueueDTO}.
 */
@Mapper(componentModel = "spring", uses = {})
public interface QueueMapper extends EntityMapper<QueueDTO, Queue> {



    default Queue fromId(Long id) {
        if (id == null) {
            return null;
        }
        Queue queue = new Queue();
        queue.setId(id);
        return queue;
    }
}
