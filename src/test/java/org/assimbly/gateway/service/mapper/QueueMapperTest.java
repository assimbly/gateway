package org.assimbly.gateway.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class QueueMapperTest {

    private QueueMapper queueMapper;

    @BeforeEach
    public void setUp() {
        queueMapper = new QueueMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(queueMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(queueMapper.fromId(null)).isNull();
    }
}
