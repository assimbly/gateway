package org.assimbly.gateway.service.api;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Link;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.FlowService;
import org.assimbly.gateway.service.dto.ApiDTO;
import org.assimbly.gateway.service.dto.ApiDeclaredResponseDTO;
import org.assimbly.gateway.service.dto.ApiOperationDTO;
import org.assimbly.gateway.service.dto.ApiParameterDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** The rules of APIs and Operations, and how an Operation keeps its Handler Flow (docs/specs/rest-api-builder.md, seam C). */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class ApiServiceIntTest {

    @Autowired
    private ApiService apiService;

    @Autowired
    private FlowService flowService;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private IntegrationRepository integrationRepository;

    private Long integrationId;

    @BeforeEach
    void createIntegration() {
        Integration integration = new Integration();
        integration.setName("apis");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integrationId = integrationRepository.save(integration).getId();
    }

    @Test
    void aNewOperationGetsAVisualHandlerFlowThatAnswersRightAway() {
        ApiDTO api = api("Customers", "/customers");

        ApiOperationDTO operation = apiService.createOperation(api.id(), operation("GET", "/{id}"));

        Flow flow = flowRepository.findById(operation.handlerFlowId()).orElseThrow();
        assertThat(flow.getType()).isEqualTo("flow");
        assertThat(flow.getIntegration().getId()).isEqualTo(integrationId);

        Step source = step(flow, StepType.SOURCE);
        assertThat(source.getComponentType()).isEqualTo("rest");
        assertThat(options(source)).containsEntry("method", "get").containsEntry("path", "/customers/{id}").containsEntry("exchangePattern", "InOut");

        Step response = step(flow, StepType.SINK);
        assertThat(response.getComponentType()).isEqualTo("setmessage");
        assertThat(options(response)).containsEntry("status", "200");
        assertThat(response.getUri()).isNullOrEmpty();

        assertThat(step(flow, StepType.ERROR).getComponentType()).isEqualTo("log");

        Link out = source.getLinks().iterator().next();
        Link in = response.getLinks().iterator().next();
        assertThat(out.getBound()).isEqualTo("out");
        assertThat(in.getBound()).isEqualTo("in");
        assertThat(out.getName()).isEqualTo(in.getName()).isEqualTo(flow.getId() + "-" + response.getId());
    }

    @Test
    void aHandlerFlowIsAlwaysAVisualFlowWhateverFlowTypeIsAsked() {
        ApiDTO api = api("Customers", "/customers");

        ApiOperationDTO operation = apiService.createOperation(api.id(), withFlowType(operation("POST", "/"), "script"));

        Flow flow = flowRepository.findById(operation.handlerFlowId()).orElseThrow();
        assertThat(flow.getType()).isEqualTo("flow");
        assertThat(options(step(flow, StepType.SOURCE))).containsEntry("method", "post").containsEntry("path", "/customers");
        assertThat(flow.getSteps()).noneMatch(s -> s.getStepType() == StepType.SCRIPT);
    }

    @Test
    void theHandlerFlowIsNamedAfterTheOperationIdOrElseItsMethodAndPath() {
        ApiDTO api = api("Customers", "/customers");

        ApiOperationDTO named = apiService.createOperation(api.id(), withOperationId(operation("GET", "/"), "listCustomers"));
        ApiOperationDTO unnamed = apiService.createOperation(api.id(), operation("DELETE", "/{id}"));

        assertThat(named.handlerFlowName()).isEqualTo("listCustomers");
        assertThat(unnamed.handlerFlowName()).isEqualTo("delete-customers-id");
    }

    @Test
    void aMethodAndFullPathCanOnlyBeClaimedOnceAcrossAllApis() {
        ApiDTO customers = api("Customers", "/customers");
        ApiDTO shop = api("Shop", "/");
        apiService.createOperation(customers.id(), operation("GET", "/{id}"));

        assertThatThrownBy(() -> apiService.createOperation(shop.id(), operation("GET", "/customers/{key}")))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("GET /customers/{id}")
            .hasMessageContaining("Customers");

        apiService.createOperation(shop.id(), operation("PUT", "/customers/{key}"));
        apiService.createOperation(shop.id(), operation("GET", "/customers/{key}/orders"));
    }

    @Test
    void changingAnOperationIsCheckedForConflictsToo() {
        ApiDTO api = api("Customers", "/customers");
        apiService.createOperation(api.id(), operation("GET", "/{id}"));
        ApiOperationDTO other = apiService.createOperation(api.id(), operation("GET", "/"));

        assertThatThrownBy(() -> apiService.updateOperation(api.id(), other.id(), withPath(other, "/{customerId}")))
            .isInstanceOf(ApiRuleException.class);

        // Saving an Operation unchanged doesn't clash with itself.
        apiService.updateOperation(api.id(), other.id(), other);
    }

    @Test
    void aBasePathBelongsToOneApiAndMovingItIsCheckedForConflicts() {
        api("Customers", "/customers");
        assertThatThrownBy(() -> api("Clients", "/customers/")).isInstanceOf(ApiRuleException.class).hasMessageContaining("base path");

        ApiDTO shop = api("Shop", "/shop");
        apiService.createOperation(shop.id(), operation("GET", "/customers"));
        ApiDTO crm = api("CRM", "/crm");
        apiService.createOperation(crm.id(), operation("GET", "/shop/customers"));

        assertThatThrownBy(() -> apiService.updateApi(crm.id(), withBasePath(crm, "/shop/")))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("base path /shop already belongs to the API Shop");
        assertThatThrownBy(() -> apiService.updateApi(crm.id(), withBasePath(crm, "/")))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("GET /shop/customers of the API Shop");
    }

    @Test
    void anOperationIdIsUniqueWithinItsApi() {
        ApiDTO api = api("Customers", "/customers");
        apiService.createOperation(api.id(), withOperationId(operation("GET", "/"), "list"));

        assertThatThrownBy(() -> apiService.createOperation(api.id(), withOperationId(operation("POST", "/"), "list")))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("list");
    }

    @Test
    void pathParametersFollowThePathTemplateAndKeepTheirDescription() {
        ApiDTO api = api("Customers", "/customers");
        ApiOperationDTO typed = withParameters(operation("GET", "/{id}/orders/{orderId}"), List.of(
            new ApiParameterDTO("id", "path", "integer", false, "The customer"),
            new ApiParameterDTO("stale", "path", "string", true, "No longer in the path"),
            new ApiParameterDTO("limit", "query", "integer", false, "At most this many")
        ));

        ApiOperationDTO saved = apiService.createOperation(api.id(), typed);

        assertThat(saved.parameters()).containsExactly(
            new ApiParameterDTO("id", "path", "integer", true, "The customer"),
            new ApiParameterDTO("orderId", "path", "string", true, null),
            new ApiParameterDTO("limit", "query", "integer", false, "At most this many")
        );
    }

    @Test
    void declaredResponsesAreUniqueByStatusAndNeedADescription() {
        ApiDTO api = api("Customers", "/customers");

        assertThatThrownBy(() -> apiService.createOperation(api.id(), withResponses(operation("GET", "/"), List.of(
            new ApiDeclaredResponseDTO("200", "OK", null, null),
            new ApiDeclaredResponseDTO("200", "Also OK", null, null)
        )))).isInstanceOf(ApiRuleException.class).hasMessageContaining("200");

        assertThatThrownBy(() -> apiService.createOperation(api.id(), withResponses(operation("GET", "/"), List.of(
            new ApiDeclaredResponseDTO("200", " ", null, null)
        )))).isInstanceOf(ApiRuleException.class).hasMessageContaining("description");

        assertThatThrownBy(() -> apiService.createOperation(api.id(), withResponses(operation("GET", "/"), List.of(
            new ApiDeclaredResponseDTO("700", "Too far", null, null)
        )))).isInstanceOf(ApiRuleException.class).hasMessageContaining("700");

        ApiOperationDTO saved = apiService.createOperation(api.id(), withResponses(operation("GET", "/"), List.of(
            new ApiDeclaredResponseDTO("200", "OK", "application/json", "{\"type\":\"object\"}"),
            new ApiDeclaredResponseDTO("default", "Anything else", null, null)
        )));
        assertThat(saved.declaredResponses()).extracting(ApiDeclaredResponseDTO::status).containsExactly("200", "default");
    }

    @Test
    void savingAnOperationRewritesItsHandlerFlowsSource() {
        ApiDTO api = api("Customers", "/customers");
        ApiOperationDTO operation = apiService.createOperation(api.id(), operation("GET", "/{id}"));

        apiService.updateOperation(api.id(), operation.id(), withMethod(withPath(operation, "/{id}/details"), "POST"));

        Flow flow = flowRepository.findById(operation.handlerFlowId()).orElseThrow();
        assertThat(options(step(flow, StepType.SOURCE))).containsEntry("method", "post").containsEntry("path", "/customers/{id}/details");
    }

    @Test
    void movingAnApisBasePathRewritesTheSourceOfEachHandlerFlow() {
        ApiDTO api = api("Customers", "/customers");
        ApiOperationDTO operation = apiService.createOperation(api.id(), operation("GET", "/{id}"));

        apiService.updateApi(api.id(), withBasePath(api, "/clients"));

        Flow flow = flowRepository.findById(operation.handlerFlowId()).orElseThrow();
        assertThat(options(step(flow, StepType.SOURCE))).containsEntry("path", "/clients/{id}");
    }

    @Test
    void deletingAnOperationDeletesItsHandlerFlow() {
        ApiDTO api = api("Customers", "/customers");
        ApiOperationDTO operation = apiService.createOperation(api.id(), operation("GET", "/{id}"));

        apiService.deleteOperation(api.id(), operation.id());

        assertThat(flowRepository.findById(operation.handlerFlowId())).isEmpty();
        assertThat(apiService.findOne(api.id()).orElseThrow().operations()).isEmpty();
    }

    @Test
    void deletingAnApiDeletesAllItsOperationsAndHandlerFlows() {
        ApiDTO api = api("Customers", "/customers");
        ApiOperationDTO get = apiService.createOperation(api.id(), operation("GET", "/{id}"));
        ApiOperationDTO post = apiService.createOperation(api.id(), operation("POST", "/"));

        apiService.deleteApi(api.id());

        assertThat(apiService.findOne(api.id())).isEmpty();
        assertThat(flowRepository.findById(get.handlerFlowId())).isEmpty();
        assertThat(flowRepository.findById(post.handlerFlowId())).isEmpty();
    }

    @Test
    void aHandlerFlowCantBeDeletedOnItsOwn() {
        ApiDTO api = api("Customers", "/customers");
        ApiOperationDTO operation = apiService.createOperation(api.id(), operation("GET", "/{id}"));

        assertThatThrownBy(() -> flowService.delete(operation.handlerFlowId()))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("GET /customers/{id}")
            .hasMessageContaining("Customers");
        assertThat(flowRepository.findById(operation.handlerFlowId())).isPresent();
    }

    @Test
    void aFlowKnowsWhenItHandlesAnOperation() {
        ApiDTO api = api("Customers", "/customers");
        ApiOperationDTO operation = apiService.createOperation(api.id(), withResponses(operation("GET", "/{id}"), List.of(
            new ApiDeclaredResponseDTO("200", "Found", null, null),
            new ApiDeclaredResponseDTO("404", "Not found", null, null)
        )));

        var handler = apiService.handlerOf(operation.handlerFlowId()).orElseThrow();

        assertThat(handler.apiName()).isEqualTo("Customers");
        assertThat(handler.method()).isEqualTo("GET");
        assertThat(handler.fullPath()).isEqualTo("/customers/{id}");
        assertThat(handler.declaredStatuses()).containsExactly("200", "404");
        assertThat(handler.responseMediaType()).isEqualTo("application/json");
    }

    private ApiDTO api(String name, String basePath) {
        return apiService.createApi(new ApiDTO(null, name, basePath, "1.0", null, integrationId, 0, null));
    }

    private static ApiOperationDTO operation(String method, String path) {
        return new ApiOperationDTO(null, null, method, path, null, null, null, null, null, null, null, List.of(), List.of(), null, null, null);
    }

    private static ApiOperationDTO withFlowType(ApiOperationDTO o, String flowType) {
        return new ApiOperationDTO(o.id(), o.apiId(), o.method(), o.path(), o.fullPath(), o.operationId(), o.summary(), o.description(),
            o.requestMediaType(), o.responseMediaType(), o.requestSchema(), o.parameters(), o.declaredResponses(), o.handlerFlowId(), o.handlerFlowName(), flowType);
    }

    private static ApiOperationDTO withOperationId(ApiOperationDTO o, String operationId) {
        return new ApiOperationDTO(o.id(), o.apiId(), o.method(), o.path(), o.fullPath(), operationId, o.summary(), o.description(),
            o.requestMediaType(), o.responseMediaType(), o.requestSchema(), o.parameters(), o.declaredResponses(), o.handlerFlowId(), o.handlerFlowName(), o.flowType());
    }

    private static ApiOperationDTO withPath(ApiOperationDTO o, String path) {
        return new ApiOperationDTO(o.id(), o.apiId(), o.method(), path, o.fullPath(), o.operationId(), o.summary(), o.description(),
            o.requestMediaType(), o.responseMediaType(), o.requestSchema(), o.parameters(), o.declaredResponses(), o.handlerFlowId(), o.handlerFlowName(), o.flowType());
    }

    private static ApiOperationDTO withMethod(ApiOperationDTO o, String method) {
        return new ApiOperationDTO(o.id(), o.apiId(), method, o.path(), o.fullPath(), o.operationId(), o.summary(), o.description(),
            o.requestMediaType(), o.responseMediaType(), o.requestSchema(), o.parameters(), o.declaredResponses(), o.handlerFlowId(), o.handlerFlowName(), o.flowType());
    }

    private static ApiOperationDTO withParameters(ApiOperationDTO o, List<ApiParameterDTO> parameters) {
        return new ApiOperationDTO(o.id(), o.apiId(), o.method(), o.path(), o.fullPath(), o.operationId(), o.summary(), o.description(),
            o.requestMediaType(), o.responseMediaType(), o.requestSchema(), parameters, o.declaredResponses(), o.handlerFlowId(), o.handlerFlowName(), o.flowType());
    }

    private static ApiOperationDTO withResponses(ApiOperationDTO o, List<ApiDeclaredResponseDTO> responses) {
        return new ApiOperationDTO(o.id(), o.apiId(), o.method(), o.path(), o.fullPath(), o.operationId(), o.summary(), o.description(),
            o.requestMediaType(), o.responseMediaType(), o.requestSchema(), o.parameters(), responses, o.handlerFlowId(), o.handlerFlowName(), o.flowType());
    }

    private static ApiDTO withBasePath(ApiDTO a, String basePath) {
        return new ApiDTO(a.id(), a.name(), basePath, a.versionLabel(), a.description(), a.integrationId(), a.operationCount(), null);
    }

    private static Step step(Flow flow, StepType type) {
        return flow.getSteps().stream().filter(s -> s.getStepType() == type).findFirst().orElseThrow();
    }

    private static Map<String, String> options(Step step) {
        return java.util.Arrays.stream(step.getOptions().split("&"))
            .map(option -> option.split("=", 2))
            .collect(Collectors.toMap(pair -> pair[0], pair -> pair.length > 1 ? pair[1] : ""));
    }
}
