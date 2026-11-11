package org.assimbly.gateway.config;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.parameters.RequestBody;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.web.rest.gateway.AccountResource;
import org.assimbly.gateway.web.rest.integration.FlowResource;
import org.junit.jupiter.api.Test;
import org.springframework.objenesis.ObjenesisStd;
import org.springframework.web.method.HandlerMethod;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

/** The Swagger UI request body of a gateway REST resource gets a description and an example; other resources are left alone. */
class OpenApiDocsConfigurationTest {

    private final OpenApiDocsConfiguration configuration = new OpenApiDocsConfiguration();

    @Test
    void anUpdateBodyGetsTheExampleOfItsDtoWithAnId() throws NoSuchMethodException {
        Operation operation = operationWithJsonBody();

        configuration.gatewayBodyDocs().customize(operation, handlerOf(FlowResource.class, "updateFlow", FlowDTO.class));

        JsonNode example = (JsonNode) example(operation);
        assertThat(example.get("name").asText()).isEqualTo("Scheduler");
        assertThat(example.get("id").asInt()).isEqualTo(1);
    }

    @Test
    void aStringBodyGetsADescriptionAndAnExample() throws NoSuchMethodException {
        Operation operation = operationWithJsonBody();

        configuration.gatewayBodyDocs().customize(operation, handlerOf(AccountResource.class, "requestPasswordReset", String.class));

        assertThat(operation.getRequestBody().getDescription()).isEqualTo("Email address of the account");
        assertThat(example(operation)).isEqualTo("john@example.com");
    }

    @Test
    void aResourceOutsideTheGatewayIsLeftAlone() throws NoSuchMethodException {
        Operation operation = operationWithJsonBody();

        configuration.gatewayBodyDocs().customize(operation, new HandlerMethod(new Object(), Object.class.getMethod("toString")));

        assertThat(operation.getRequestBody().getDescription()).isNull();
        assertThat(example(operation)).isNull();
    }

    private static Operation operationWithJsonBody() {
        Content content = new Content().addMediaType("application/json", new MediaType());
        return new Operation().requestBody(new RequestBody().content(content));
    }

    private static Object example(Operation operation) {
        return operation.getRequestBody().getContent().get("application/json").getExample();
    }

    // The resources need services to be built; the customizer only reads their class and method
    private static HandlerMethod handlerOf(Class<?> resource, String name, Class<?>... parameterTypes) throws NoSuchMethodException {
        Method method = resource.getMethod(name, parameterTypes);
        return new HandlerMethod(new ObjenesisStd().newInstance(resource), method);
    }
}
