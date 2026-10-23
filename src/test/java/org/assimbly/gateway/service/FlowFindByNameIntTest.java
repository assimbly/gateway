package org.assimbly.gateway.service;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.service.importing.FlowImportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/** A Flow is found by its exact name; a tutorial that asks for "TestFlow" also finds "Testflow". */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class FlowFindByNameIntTest {

    private static final String ROUTE = """
        <route id="timer-to-log" xmlns="http://camel.apache.org/schema/spring">
            <from uri="timer:tick?period=1000"/>
            <log message="tick"/>
        </route>
        """;

    @Autowired
    private FlowService flowService;

    @Autowired
    private FlowImportService flowImportService;

    @Autowired
    private IntegrationRepository integrationRepository;

    private Long integrationId;

    @BeforeEach
    void createIntegration() {
        Integration integration = new Integration();
        integration.setName("find-by-name");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integrationId = integrationRepository.save(integration).getId();
    }

    @Test
    void theExactNameIsFound() {
        Long flowId = flowImportService.importCamel(integrationId, ROUTE, "Testflow").flowId();

        assertThat(flowService.findByName("Testflow")).map(FlowDTO::getId).contains(flowId);
        assertThat(flowService.findByName("TestFlow")).isEmpty();
    }

    @Test
    void ignoringCaseFindsTheNameInAnotherCase() {
        Long flowId = flowImportService.importCamel(integrationId, ROUTE, "Testflow").flowId();

        assertThat(flowService.findByName("TestFlow", true)).map(FlowDTO::getId).contains(flowId);
        assertThat(flowService.findByName("OtherFlow", true)).isEmpty();
    }

    @Test
    void ignoringCasePrefersTheExactName() {
        flowImportService.importCamel(integrationId, ROUTE, "Testflow");
        Long exactId = flowImportService.importCamel(integrationId, ROUTE, "TestFlow").flowId();

        assertThat(flowService.findByName("TestFlow", true)).map(FlowDTO::getId).contains(exactId);
    }
}
