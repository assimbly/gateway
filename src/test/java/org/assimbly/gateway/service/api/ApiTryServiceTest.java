package org.assimbly.gateway.service.api;

import org.junit.jupiter.api.Test;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ApiTryServiceTest {

    @Test
    void callsTheOperationsOwnPathOnTheRuntimeWithTheParametersFilledIn() {
        Map<String, String> query = new LinkedHashMap<>();
        query.put("limit", "10");
        query.put("q", "a b&c");

        URI uri = ApiTryService.target("https://localhost:9001", "/_acme/customers/{id}/orders/{orderId}",
            Map.of("id", "4 2", "orderId", "x/y"), query);

        assertThat(uri.toString()).isEqualTo("https://localhost:9001/_acme/customers/4%202/orders/x%2Fy?limit=10&q=a%20b%26c");
    }

    @Test
    void aPathParameterCantLeaveTheOperationsPath() {
        assertThatThrownBy(() -> ApiTryService.target("https://localhost:9001", "/customers/{id}", Map.of("id", ".."), Map.of()))
            .isInstanceOf(ApiRuleException.class);
        assertThatThrownBy(() -> ApiTryService.target("https://localhost:9001", "/customers/{id}", Map.of(), Map.of()))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("id");
    }

    @Test
    void theListenerUrlKeepsItsOwnHostWhateverTheParametersSay() {
        URI uri = ApiTryService.target("https://localhost:9001/", "/c/{id}", Map.of("id", "@evil.example.com"), Map.of());

        assertThat(uri.getHost()).isEqualTo("localhost");
        assertThat(uri.getPort()).isEqualTo(9001);
    }
}
