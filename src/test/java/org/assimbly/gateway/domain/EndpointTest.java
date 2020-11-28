package org.assimbly.gateway.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.assimbly.gateway.web.rest.TestUtil;

public class EndpointTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Endpoint.class);
        Endpoint endpoint1 = new Endpoint();
        endpoint1.setId(1L);
        Endpoint endpoint2 = new Endpoint();
        endpoint2.setId(endpoint1.getId());
        assertThat(endpoint1).isEqualTo(endpoint2);
        endpoint2.setId(2L);
        assertThat(endpoint1).isNotEqualTo(endpoint2);
        endpoint1.setId(null);
        assertThat(endpoint1).isNotEqualTo(endpoint2);
    }
}
