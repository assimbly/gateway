package org.assimbly.gateway.service.dto;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.assimbly.gateway.web.rest.TestUtil;

public class EndpointDTOTest {

    @Test
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(EndpointDTO.class);
        EndpointDTO endpointDTO1 = new EndpointDTO();
        endpointDTO1.setId(1L);
        EndpointDTO endpointDTO2 = new EndpointDTO();
        assertThat(endpointDTO1).isNotEqualTo(endpointDTO2);
        endpointDTO2.setId(endpointDTO1.getId());
        assertThat(endpointDTO1).isEqualTo(endpointDTO2);
        endpointDTO2.setId(2L);
        assertThat(endpointDTO1).isNotEqualTo(endpointDTO2);
        endpointDTO1.setId(null);
        assertThat(endpointDTO1).isNotEqualTo(endpointDTO2);
    }
}
