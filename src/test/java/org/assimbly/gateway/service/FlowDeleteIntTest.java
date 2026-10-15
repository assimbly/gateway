package org.assimbly.gateway.service;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.repository.RouteRepository;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.gateway.service.importing.FlowImportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;

/** A Route Flow takes its Routes along when it is deleted, unless another Flow still runs them. */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class FlowDeleteIntTest {

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

    @Autowired
    private StepRepository stepRepository;

    @Autowired
    private RouteRepository routeRepository;

    private Long integrationId;

    @BeforeEach
    void createIntegration() {
        Integration integration = new Integration();
        integration.setName("delete");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integrationId = integrationRepository.save(integration).getId();
    }

    @Test
    void deletingARouteFlowDeletesItsRoute() {
        Long flowId = flowImportService.importCamel(integrationId, ROUTE, "Ticker").flowId();
        Integer routeId = routeIdOf(flowId);

        flowService.delete(flowId);

        assertThat(routeRepository.findById(routeId.longValue())).isEmpty();
    }

    @Test
    void aRouteAnotherFlowRunsIsKept() {
        Long flowId = flowImportService.importCamel(integrationId, ROUTE, "Ticker").flowId();
        Integer routeId = routeIdOf(flowId);

        Long otherFlowId = flowImportService.importCamel(integrationId, ROUTE, "Other ticker").flowId();
        Step otherStep = stepRepository.findByFlowId(otherFlowId).stream()
            .filter(step -> step.getRouteId() != null)
            .findFirst().orElseThrow();
        otherStep.setRouteId(routeId);
        stepRepository.save(otherStep);

        flowService.delete(flowId);

        assertThat(routeRepository.findById(routeId.longValue())).isPresent();
    }

    private Integer routeIdOf(Long flowId) {
        return stepRepository.findByFlowId(flowId).stream()
            .map(Step::getRouteId)
            .filter(Objects::nonNull)
            .findFirst().orElseThrow();
    }
}
