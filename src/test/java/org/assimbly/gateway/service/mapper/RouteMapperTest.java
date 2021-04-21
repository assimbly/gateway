package org.assimbly.gateway.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class RouteMapperTest {

    private RouteMapper routeMapper;

    @BeforeEach
    public void setUp() {
        routeMapper = new RouteMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(routeMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(routeMapper.fromId(null)).isNull();
    }
}
