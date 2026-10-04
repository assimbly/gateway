package org.assimbly.gateway.service.api;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.core.util.Json;
import io.swagger.v3.core.util.Yaml;
import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.dto.ApiDTO;
import org.assimbly.gateway.service.dto.ApiDeclaredResponseDTO;
import org.assimbly.gateway.service.dto.ApiImportResultDTO;
import org.assimbly.gateway.service.dto.ApiOperationDTO;
import org.assimbly.gateway.service.dto.ApiParameterDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Importing an OpenAPI document creates an API with Draft Handler Flows, and exporting it gives the contract back
 * (docs/specs/rest-api-builder.md, seam B).
 */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class OpenApiRoundTripIntTest {

    private static final String LISTENER = "https://gateway.example.com:9001";

    @Autowired
    private OpenApiService openApiService;

    @Autowired
    private ApiService apiService;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private IntegrationRepository integrationRepository;

    private Long integrationId;

    @BeforeEach
    void createIntegration() {
        Integration integration = new Integration();
        integration.setName("openapi");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integrationId = integrationRepository.save(integration).getId();
    }

    @Test
    void anImportCreatesTheApiWithItsOperationsParametersAndDeclaredResponses() throws Exception {
        ApiImportResultDTO result = openApiService.importDocument(fixture("crud-3.0.yaml"), integrationId);

        ApiDTO api = result.api();
        assertThat(api.name()).isEqualTo("Customers");
        assertThat(api.basePath()).isEqualTo("/customers");
        assertThat(api.versionLabel()).isEqualTo("2.1.0");
        assertThat(api.description()).isEqualTo("Manage customers.");
        assertThat(api.operations()).extracting(o -> o.method() + " " + o.path())
            .containsExactlyInAnyOrder("GET /", "POST /", "GET /{id}", "DELETE /{id}");

        ApiOperationDTO get = operation(api, "GET", "/{id}");
        assertThat(get.operationId()).isEqualTo("getCustomer");
        assertThat(get.parameters()).containsExactly(
            new ApiParameterDTO("id", "path", "integer", true, "The customer"),
            new ApiParameterDTO("X-Request-Id", "header", "string", false, null));
        assertThat(get.declaredResponses()).extracting(ApiDeclaredResponseDTO::status, ApiDeclaredResponseDTO::description)
            .containsExactly(org.assertj.core.groups.Tuple.tuple("200", "Found"), org.assertj.core.groups.Tuple.tuple("404", "Not found"));
        assertThat(get.responseMediaType()).isEqualTo("application/json");

        ApiOperationDTO post = operation(api, "POST", "/");
        assertThat(Json.mapper().readTree(post.requestSchema()).at("/required/0").asText()).isEqualTo("name");

        assertThat(operation(api, "GET", "/").parameters()).containsExactly(new ApiParameterDTO("limit", "query", "integer", false, "At most this many"));
    }

    @Test
    void eachImportedOperationGetsADraftHandlerFlowNamedAfterItsOperationId() throws Exception {
        ApiDTO api = openApiService.importDocument(fixture("crud-3.0.yaml"), integrationId).api();

        assertThat(api.operations()).extracting(ApiOperationDTO::handlerFlowName)
            .containsExactlyInAnyOrder("listCustomers", "createCustomer", "getCustomer", "delete-customers-id");

        Flow flow = flowRepository.findById(operation(api, "GET", "/{id}").handlerFlowId()).orElseThrow();
        assertThat(flow.getType()).isEqualTo("flow");
        // Only the Operation Source (an open end) and the Error Step: the Flow is a Draft until it answers.
        assertThat(flow.getSteps()).extracting(s -> s.getStepType()).containsExactlyInAnyOrder(StepType.SOURCE, StepType.ERROR);
    }

    @Test
    void anImportedApiExportsAsOpenApi303WithItsContract() throws Exception {
        ApiDTO api = openApiService.importDocument(fixture("crud-3.0.yaml"), integrationId).api();

        JsonNode exported = Yaml.mapper().readTree(openApiService.exportDocument(api.id(), "yaml", LISTENER));

        assertThat(exported.at("/openapi").asText()).isEqualTo("3.0.3");
        assertThat(exported.at("/info/title").asText()).isEqualTo("Customers");
        assertThat(exported.at("/info/version").asText()).isEqualTo("2.1.0");
        assertThat(exported.at("/servers/0/url").asText()).isEqualTo(LISTENER + "/customers");

        JsonNode getCustomer = exported.at("/paths/~1{id}/get");
        assertThat(getCustomer.at("/operationId").asText()).isEqualTo("getCustomer");
        assertThat(getCustomer.at("/parameters/0/name").asText()).isEqualTo("id");
        assertThat(getCustomer.at("/parameters/0/in").asText()).isEqualTo("path");
        assertThat(getCustomer.at("/parameters/0/required").asBoolean()).isTrue();
        assertThat(getCustomer.at("/parameters/0/schema/type").asText()).isEqualTo("integer");
        assertThat(getCustomer.at("/responses/404/description").asText()).isEqualTo("Not found");

        JsonNode original = Yaml.mapper().readTree(fixture("crud-3.0.yaml"));
        assertThat(getCustomer.at("/responses/200/content/application~1json/schema"))
            .isEqualTo(original.at("/paths/~1{id}/get/responses/200/content/application~1json/schema"));
        assertThat(exported.at("/paths/~1/post/requestBody/content/application~1json/schema"))
            .isEqualTo(original.at("/paths/~1/post/requestBody/content/application~1json/schema"));

        var reparsed = new io.swagger.v3.parser.OpenAPIV3Parser().readContents(openApiService.exportDocument(api.id(), "yaml", LISTENER), null, null);
        assertThat(reparsed.getMessages()).isEmpty();
    }

    @Test
    void everyExportedOperationDeclaresTheProblemAnswerForFailures() throws Exception {
        ApiDTO api = openApiService.importDocument(fixture("crud-3.0.yaml"), integrationId).api();

        JsonNode exported = Json.mapper().readTree(openApiService.exportDocument(api.id(), "json", LISTENER));

        for (String pointer : List.of("/paths/~1/get", "/paths/~1/post", "/paths/~1{id}/get", "/paths/~1{id}/delete")) {
            JsonNode problem = exported.at(pointer + "/responses/500/content/application~1problem+json/schema");
            assertThat(problem.isMissingNode()).as(pointer).isFalse();
        }
        JsonNode problemSchema = exported.at("/components/schemas/Problem/properties");
        assertThat(problemSchema.fieldNames()).toIterable().containsExactlyInAnyOrder("type", "title", "status", "detail", "instance", "correlationId");
    }

    @Test
    void theServersOfAnExportCarryTheTenantPrefix() throws Exception {
        ApiDTO api = apiService.createApi(new ApiDTO(null, "Tenanted", "/tenanted", null, null, integrationId, 0, null));

        String yaml = openApiService.exportDocument(api.id(), "yaml", LISTENER, "acme");

        assertThat(Yaml.mapper().readTree(yaml).at("/servers/0/url").asText()).isEqualTo(LISTENER + "/_acme/tenanted");
    }

    @Test
    void anOpenApi31DocumentImportsAndKeepsItsSchemas() throws Exception {
        ApiDTO api = openApiService.importDocument(fixture("crud-3.1.json"), integrationId).api();

        assertThat(api.name()).isEqualTo("Orders");
        // Without servers, the paths' shared first segment becomes the base path, so the full paths stay the same.
        assertThat(api.basePath()).isEqualTo("/orders");
        assertThat(api.operations()).extracting(o -> o.method() + " " + o.fullPath())
            .containsExactlyInAnyOrder("GET /orders/{orderId}", "PUT /orders/{orderId}");

        ApiOperationDTO get = operation(api, "GET", "/{orderId}");
        JsonNode schema = Json.mapper().readTree(get.declaredResponses().getFirst().schema());
        assertThat(schema.at("/properties/note/type")).isEqualTo(Json.mapper().readTree("[\"string\",\"null\"]"));

        JsonNode exported = Yaml.mapper().readTree(openApiService.exportDocument(api.id(), "yaml", LISTENER));
        JsonNode original = Json.mapper().readTree(fixture("crud-3.1.json"));
        assertThat(exported.at("/paths/~1{orderId}/get/responses/200/content/application~1json/schema"))
            .isEqualTo(original.at("/paths/~1orders~1{orderId}/get/responses/200/content/application~1json/schema"));
    }

    @Test
    void referencedSchemasAreResolvedIntoEachOperation() throws Exception {
        ApiDTO api = openApiService.importDocument(fixture("refs-3.0.yaml"), integrationId).api();

        ApiOperationDTO put = operation(api, "PUT", "/{petId}");
        assertThat(put.parameters()).containsExactly(new ApiParameterDTO("petId", "path", "integer", true, null));
        JsonNode request = Json.mapper().readTree(put.requestSchema());
        assertThat(request.toString()).doesNotContain("$ref");
        assertThat(request.at("/properties/owner/properties/email/format").asText()).isEqualTo("email");

        JsonNode exported = Yaml.mapper().readTree(openApiService.exportDocument(api.id(), "yaml", LISTENER));
        assertThat(exported.at("/paths/~1{petId}/put/requestBody/content/application~1json/schema")).isEqualTo(request);
    }

    @Test
    void anImportListsEverythingItDropped() throws Exception {
        ApiImportResultDTO result = openApiService.importDocument(fixture("extras-3.0.yaml"), integrationId);

        assertThat(result.api().basePath()).isEqualTo("/v3");
        assertThat(String.join("\n", result.dropped())).contains(
            "x-audience", "x-logo", "x-owner", "x-rate-limit",
            "contact", "tags", "security", "bearerAuth", "servers",
            "cookie parameter session", "example of the query parameter status",
            "callbacks", "X-Total", "examples", "application/xml");
    }

    @Test
    void aSwagger20DocumentIsRejected() {
        assertThatThrownBy(() -> openApiService.importDocument(fixture("swagger-2.0.json"), integrationId))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("Swagger 2.0")
            .hasMessageContaining("OpenAPI 3.0 and 3.1");
    }

    @Test
    void textThatIsntOpenApiIsRejected() {
        assertThatThrownBy(() -> openApiService.importDocument("hello: world", integrationId))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("OpenAPI 3.0 or 3.1");
    }

    @Test
    void anImportThatClashesWithAnExistingOperationIsRefusedAsAWhole() throws Exception {
        ApiDTO shop = apiService.createApi(new ApiDTO(null, "Shop", "/", null, null, integrationId, 0, null));
        apiService.createOperation(shop.id(), new ApiOperationDTO(null, null, "GET", "/customers/{key}", null, null, null, null,
            null, null, null, List.of(), List.of(), null, null, null));
        apiService.createOperation(shop.id(), new ApiOperationDTO(null, null, "DELETE", "/customers/{key}", null, null, null, null,
            null, null, null, List.of(), List.of(), null, null, null));
        long flowsBefore = flowRepository.count();

        assertThatThrownBy(() -> openApiService.importDocument(fixture("crud-3.0.yaml"), integrationId))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("GET /customers/{id}")
            .hasMessageContaining("DELETE /customers/{id}");

        assertThat(apiService.findAll()).extracting(ApiDTO::name).containsExactly("Shop");
        assertThat(flowRepository.count()).isEqualTo(flowsBefore);
    }

    private static ApiOperationDTO operation(ApiDTO api, String method, String path) {
        return api.operations().stream().filter(o -> o.method().equals(method) && o.path().equals(path)).findFirst().orElseThrow();
    }

    private String fixture(String name) throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/openapi/" + name)) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
