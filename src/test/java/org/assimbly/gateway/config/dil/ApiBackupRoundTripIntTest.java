package org.assimbly.gateway.config.dil;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.config.importing.Import;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.repository.MessageRepository;
import org.assimbly.gateway.repository.RouteRepository;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.gateway.service.api.ApiService;
import org.assimbly.gateway.service.dto.ApiDTO;
import org.assimbly.gateway.service.dto.ApiDeclaredResponseDTO;
import org.assimbly.gateway.service.dto.ApiOperationDTO;
import org.assimbly.gateway.service.dto.ApiParameterDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** A backup of an Integration brings its APIs back, linked to their Handler Flows (docs/specs/rest-api-builder.md, story 48). */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class ApiBackupRoundTripIntTest {

    @Autowired
    private ApiService apiService;

    @Autowired
    private Export dilExport;

    @Autowired
    private Import dilImport;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private StepRepository stepRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Test
    void anApiSurvivesABackupWithItsOperationsLinkedToTheImportedHandlerFlows() throws Exception {
        Integration integration = new Integration();
        integration.setName("backup");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        Long integrationId = integrationRepository.save(integration).getId();

        ApiDTO api = apiService.createApi(new ApiDTO(null, "Customers", "/customers", "2.0", "All about customers", integrationId, 0, null));
        ApiOperationDTO created = apiService.createOperation(api.id(), new ApiOperationDTO(null, null, "GET", "/{id}", null, "getCustomer",
            "Get one", null, null, "application/json", null,
            List.of(new ApiParameterDTO("id", "path", "integer", true, "The customer"), new ApiParameterDTO("verbose", "query", "boolean", false, null)),
            List.of(new ApiDeclaredResponseDTO("200", "Found", "application/json", "{\"type\":\"object\"}"), new ApiDeclaredResponseDTO("404", "Not found", null, null)),
            null, null, null));
        Step response = flowRepository.findById(created.handlerFlowId()).orElseThrow().getSteps().stream()
            .filter(s -> s.getStepType() == StepType.SINK).findFirst().orElseThrow();
        response.setOptions("status=201&language=simple&header.X-Trace=abc");
        response.setUri("${body}");
        stepRepository.save(response);

        String backup = dilExport.convertDBToConfiguration(integrationId, "application/xml", false);
        apiService.deleteApi(api.id());
        assertThat(flowRepository.findById(created.handlerFlowId())).isEmpty();

        dilImport.convertConfigurationToDB(integrationId, "application/xml", backup);

        ApiDTO restored = apiService.findAll().stream().filter(a -> a.name().equals("Customers")).findFirst()
            .flatMap(a -> apiService.findOne(a.id())).orElseThrow();
        assertThat(restored.basePath()).isEqualTo("/customers");
        assertThat(restored.versionLabel()).isEqualTo("2.0");
        assertThat(restored.description()).isEqualTo("All about customers");

        ApiOperationDTO operation = restored.operations().getFirst();
        assertThat(operation.method() + " " + operation.path()).isEqualTo("GET /{id}");
        assertThat(operation.operationId()).isEqualTo("getCustomer");
        assertThat(operation.summary()).isEqualTo("Get one");
        assertThat(operation.parameters()).isEqualTo(created.parameters());
        assertThat(operation.declaredResponses()).isEqualTo(created.declaredResponses());

        Flow handlerFlow = flowRepository.findById(operation.handlerFlowId()).orElseThrow();
        assertThat(handlerFlow.getName()).isEqualTo("getCustomer");
        assertThat(apiService.handlerOf(handlerFlow.getId())).isPresent();

        Step restoredResponse = handlerFlow.getSteps().stream().filter(s -> s.getStepType() == StepType.SINK).findFirst().orElseThrow();
        assertThat(restoredResponse.getComponentType()).isEqualTo("setmessage");
        assertThat(restoredResponse.getMessage()).isNull();
        assertThat(restoredResponse.getUri()).isEqualTo("${body}");
        assertThat(restoredResponse.getOptions()).isEqualTo("status=201&language=simple&header.X-Trace=abc");

        // What the export generates for the runtime isn't imported as Messages or Routes of their own.
        assertThat(messageRepository.findAll()).noneMatch(m -> m.getName().startsWith("response"));
        assertThat(routeRepository.findAll()).noneMatch(r -> r.getName().startsWith("apiproblem"));
    }
}
