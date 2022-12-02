package org.assimbly.gateway.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class StepMapperTest {

    private StepMapper stepMapper;

    @BeforeEach
    public void setUp() {
        stepMapper = new StepMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(stepMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(stepMapper.fromId(null)).isNull();
    }
}
