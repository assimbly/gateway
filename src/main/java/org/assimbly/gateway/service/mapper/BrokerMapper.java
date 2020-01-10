package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.BrokerDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Broker and its DTO BrokerDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface BrokerMapper extends EntityMapper<BrokerDTO, Broker> {



    default Broker fromId(Long id) {
        if (id == null) {
            return null;
        }
        Broker broker = new Broker();
        broker.setId(id);
        return broker;
    }
}
