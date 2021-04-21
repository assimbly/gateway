package org.assimbly.gateway.service.mapper;


import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.RouteDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Route} and its DTO {@link RouteDTO}.
 */
@Mapper(componentModel = "spring", uses = {})
public interface RouteMapper extends EntityMapper<RouteDTO, Route> {



    default Route fromId(Long id) {
        if (id == null) {
            return null;
        }
        Route route = new Route();
        route.setId(id);
        return route;
    }
}
