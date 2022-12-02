package org.assimbly.gateway.service.dto;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.assimbly.gateway.web.rest.TestUtil;

public class StepDTOTest {

    @Test
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(StepDTO.class);
        StepDTO stepDTO1 = new StepDTO();
        stepDTO1.setId(1L);
        StepDTO stepDTO2 = new StepDTO();
        assertThat(stepDTO1).isNotEqualTo(stepDTO2);
        stepDTO2.setId(stepDTO1.getId());
        assertThat(stepDTO1).isEqualTo(stepDTO2);
        stepDTO2.setId(2L);
        assertThat(stepDTO1).isNotEqualTo(stepDTO2);
        stepDTO1.setId(null);
        assertThat(stepDTO1).isNotEqualTo(stepDTO2);
    }
}
