package org.assimbly.gateway.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class EndpointMapperTest {

    private EndpointMapper endpointMapper;

    @BeforeEach
    public void setUp() {
        endpointMapper = new EndpointMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(endpointMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(endpointMapper.fromId(null)).isNull();
    }
}
