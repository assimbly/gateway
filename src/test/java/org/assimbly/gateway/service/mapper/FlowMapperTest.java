package org.assimbly.gateway.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class FlowMapperTest {

    private FlowMapper flowMapper;

    @BeforeEach
    public void setUp() {
        flowMapper = new FlowMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(flowMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(flowMapper.fromId(null)).isNull();
    }
}
