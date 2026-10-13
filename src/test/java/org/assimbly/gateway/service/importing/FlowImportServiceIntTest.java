package org.assimbly.gateway.service.importing;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Link;
import org.assimbly.gateway.domain.Route;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.repository.RouteRepository;
import org.assimbly.gateway.service.dto.FlowImportResultDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Importing a Flow from DIL, Camel XML or a script gives a Flow of the right type, with the Steps, Routes and Links
 * its editor would have saved.
 */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class FlowImportServiceIntTest {

    private static final String ROUTE = """
        <route id="timer-to-log" xmlns="http://camel.apache.org/schema/spring">
            <from uri="timer:tick?period=1000"/>
            <log message="tick"/>
        </route>
        """;

    @Autowired
    private FlowImportService flowImportService;

    @Autowired
    private Export dilExport;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private RouteRepository routeRepository;

    private Long integrationId;

    @BeforeEach
    void createIntegration() {
        Integration integration = new Integration();
        integration.setName("import");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integrationId = integrationRepository.save(integration).getId();
    }

    // ---- DIL ----

    @Test
    void aDilFlowIsImportedAndTheResultSaysWhichFlowItBecame() throws Exception {
        FlowImportResultDTO result = flowImportService.importDil(integrationId, "application/xml", fixture("empty-flow.xml"), false);

        assertThat(result.name()).isEqualTo("EmptyFlow");
        assertThat(result.type()).isEqualTo("esb");
        assertThat(result.replaced()).isFalse();
        Flow flow = flowRepository.findById(result.flowId()).orElseThrow();
        assertThat(flow.getName()).isEqualTo("EmptyFlow");
        assertThat(flow.getIntegration().getId()).isEqualTo(integrationId);
    }

    @Test
    void importingADilFlowAgainReplacesTheFlowWithTheSameName() throws Exception {
        FlowImportResultDTO first = flowImportService.importDil(integrationId, "application/xml", fixture("empty-flow.xml"), false);

        FlowImportResultDTO second = flowImportService.importDil(integrationId, "application/xml", fixture("empty-flow.xml"), false);

        assertThat(second.replaced()).isTrue();
        assertThat(second.flowId()).isEqualTo(first.flowId());
        assertThat(flowRepository.findAll().stream().filter(flow -> "EmptyFlow".equals(flow.getName()))).hasSize(1);
    }

    @Test
    void importingADilFlowAgainAsRenameKeepsTheExistingFlow() throws Exception {
        FlowImportResultDTO first = flowImportService.importDil(integrationId, "application/xml", fixture("empty-flow.xml"), true);

        FlowImportResultDTO second = flowImportService.importDil(integrationId, "application/xml", fixture("empty-flow.xml"), true);

        assertThat(first.name()).isEqualTo("EmptyFlow");
        assertThat(second.name()).isEqualTo("EmptyFlow-2");
        assertThat(second.replaced()).isFalse();
        assertThat(second.flowId()).isNotEqualTo(first.flowId());
        assertThat(flowRepository.findById(first.flowId()).orElseThrow().getName()).isEqualTo("EmptyFlow");
    }

    @Test
    void aDilFileWithTwoFlowsIsRefused() {
        String twoFlows = """
            <dil><integrations><integration><id>1</id><flows>
              <flow><id>a</id><name>A</name></flow>
              <flow><id>b</id><name>B</name></flow>
            </flows></integration></integrations><core/></dil>
            """;

        assertThatThrownBy(() -> flowImportService.importDil(integrationId, "application/xml", twoFlows, false))
            .isInstanceOf(FlowImportException.class)
            .hasMessageContaining("2 Flows");
    }

    @Test
    void aDilFileWithoutAFlowIsRefused() {
        String noFlow = "<dil><integrations><integration><id>1</id></integration></integrations><core/></dil>";

        assertThatThrownBy(() -> flowImportService.importDil(integrationId, "application/xml", noFlow, false))
            .isInstanceOf(FlowImportException.class)
            .hasMessageContaining("doesn't contain a Flow");
    }

    @Test
    void anEmptyDilFileIsRefused() {
        assertThatThrownBy(() -> flowImportService.importDil(integrationId, "application/xml", "  ", false))
            .isInstanceOf(FlowImportException.class);
    }

    @Test
    void aDilImportIntoAnIntegrationThatDoesNotExistIsRefused() {
        assertThatThrownBy(() -> flowImportService.importDil(-1L, "application/xml", "<dil/>", false))
            .isInstanceOf(FlowImportException.class)
            .hasMessageContaining("doesn't exist");
    }

    // ---- Camel XML ----

    @Test
    void aCamelRouteBecomesARouteFlowWithARouteStepAndAnEmptyErrorHandler() {
        FlowImportResultDTO result = flowImportService.importCamel(integrationId, ROUTE, null);

        assertThat(result.type()).isEqualTo("route");
        assertThat(result.name()).isEqualTo("timer-to-log");
        assertThat(result.warnings()).isEmpty();

        List<Step> steps = stepsOf(result);
        assertThat(steps).extracting(Step::getStepType).containsExactly(StepType.ROUTE, StepType.ERROR);
        assertThat(steps.get(1).getRouteId()).isNull();

        Route route = routeRepository.findById(steps.get(0).getRouteId().longValue()).orElseThrow();
        assertThat(route.getName()).isEqualTo("timer-to-log");
        assertThat(route.getType()).isEqualTo("xml");
        assertThat(route.getContent())
            .contains("<route")
            .contains("xmlns=\"http://camel.apache.org/schema/spring\"")
            .contains("timer:tick?period=1000")
            .doesNotContain("<?xml");
    }

    @Test
    void theRouteStepIsLinkedTheWayTheRouteEditorLinksIt() {
        FlowImportResultDTO result = flowImportService.importCamel(integrationId, ROUTE, null);

        Step routeStep = stepsOf(result).get(0);
        assertThat(routeStep.getLinks()).extracting(Link::getBound, Link::getName)
            .containsExactly(org.assertj.core.api.Assertions.tuple("out", result.flowId() + "-" + routeStep.getId()));
    }

    @Test
    void theNameGivenIsTheNameOfTheFlow() {
        FlowImportResultDTO result = flowImportService.importCamel(integrationId, ROUTE, "  My route  ");

        assertThat(result.name()).isEqualTo("My route");
    }

    @Test
    void aRoutesDocumentBecomesOneFlowWithARouteStepPerRouteAndTellsWhatItLeftOut() {
        String routes = """
            <routes xmlns="http://camel.apache.org/schema/spring">
                <routeConfiguration id="errors"><onException><exception>java.lang.Exception</exception></onException></routeConfiguration>
                <route id="first"><from uri="direct:first"/><log message="1"/></route>
                <route><from uri="direct:second"/><log message="2"/></route>
            </routes>
            """;

        FlowImportResultDTO result = flowImportService.importCamel(integrationId, routes, null);

        assertThat(result.name()).isEqualTo("first");
        assertThat(stepsOf(result)).extracting(Step::getStepType).containsExactly(StepType.ROUTE, StepType.ROUTE, StepType.ERROR);
        List<Step> routeSteps = stepsOf(result).subList(0, 2);
        assertThat(routeSteps.stream().map(step -> routeRepository.findById(step.getRouteId().longValue()).orElseThrow().getName()))
            .containsExactly("first", "route-2");
        assertThat(routeRepository.findById(routeSteps.get(1).getRouteId().longValue()).orElseThrow().getContent())
            .contains("xmlns=\"http://camel.apache.org/schema/spring\"")
            .contains("direct:second");
        assertThat(result.warnings()).hasSize(2);
        assertThat(result.warnings().get(0)).contains("<routeConfiguration>");
        assertThat(result.warnings().get(1)).contains("first, route-2");

        // the second Route Step takes over from the first, as in the editor
        Step second = routeSteps.get(1);
        assertThat(second.getLinks()).extracting(Link::getBound, Link::getName)
            .containsExactlyInAnyOrder(
                org.assertj.core.api.Assertions.tuple("out", result.flowId() + "-" + second.getId()),
                org.assertj.core.api.Assertions.tuple("in", result.flowId() + "-" + routeSteps.get(0).getId()));
    }

    @Test
    void aCamelContextInsideSpringBeansIsRead() {
        String beans = """
            <beans xmlns="http://www.springframework.org/schema/beans">
                <camelContext xmlns="http://camel.apache.org/schema/spring">
                    <route id="in-spring"><from uri="direct:a"/><log message="a"/></route>
                </camelContext>
            </beans>
            """;

        FlowImportResultDTO result = flowImportService.importCamel(integrationId, beans, null);

        assertThat(result.name()).isEqualTo("in-spring");
        Route route = routeRepository.findById(stepsOf(result).get(0).getRouteId().longValue()).orElseThrow();
        assertThat(route.getContent()).contains("xmlns=\"http://camel.apache.org/schema/spring\"").contains("direct:a");
    }

    @Test
    void aFlowAndARouteWithTheNameOfAnExistingOneGetANumberedName() {
        FlowImportResultDTO first = flowImportService.importCamel(integrationId, ROUTE, null);

        FlowImportResultDTO second = flowImportService.importCamel(integrationId, ROUTE, null);

        assertThat(second.name()).isEqualTo("timer-to-log-2");
        assertThat(second.flowId()).isNotEqualTo(first.flowId());
        assertThat(routeRepository.findByName("timer-to-log-2")).isPresent();
    }

    @Test
    void camelXmlThatIsNotXmlIsRefused() {
        assertThatThrownBy(() -> flowImportService.importCamel(integrationId, "from(\"timer:x\").log(\"x\")", null))
            .isInstanceOf(FlowImportException.class)
            .hasMessageContaining("isn't valid XML");
    }

    @Test
    void xmlThatIsNotCamelIsRefused() {
        assertThatThrownBy(() -> flowImportService.importCamel(integrationId, "<dil><flows/></dil>", null))
            .isInstanceOf(FlowImportException.class)
            .hasMessageContaining("expected <route>, <routes> or <camelContext>");
    }

    @Test
    void camelXmlWithoutARouteIsRefused() {
        assertThatThrownBy(() -> flowImportService.importCamel(integrationId, "<routes/>", null))
            .isInstanceOf(FlowImportException.class)
            .hasMessageContaining("doesn't contain a Camel route");
    }

    @Test
    void camelXmlWithADoctypeIsRefused() {
        String xxe = "<!DOCTYPE route [<!ENTITY x SYSTEM \"file:///etc/passwd\">]><route><log message=\"&x;\"/></route>";

        assertThatThrownBy(() -> flowImportService.importCamel(integrationId, xxe, null))
            .isInstanceOf(FlowImportException.class);
    }

    @Test
    void aRefusedCamelImportLeavesNoFlowBehind() {
        long flows = flowRepository.count();

        assertThatThrownBy(() -> flowImportService.importCamel(integrationId, "<routes/>", "Nothing"))
            .isInstanceOf(FlowImportException.class);

        assertThat(flowRepository.count()).isEqualTo(flows);
    }

    @Test
    void aRouteFlowIsExportedAsDilAndImportedAgain() throws Exception {
        FlowImportResultDTO imported = flowImportService.importCamel(integrationId, ROUTE, null);

        String exported = dilExport.convertDBToFlowConfiguration(imported.flowId(), "application/xml", false);
        assertThat(exported).contains("timer:tick?period=1000");

        FlowImportResultDTO again = flowImportService.importDil(integrationId, "application/xml", exported, true);

        assertThat(again.name()).isEqualTo("timer-to-log-2");
        assertThat(again.type()).isEqualTo("route");
        assertThat(again.flowId()).isNotEqualTo(imported.flowId());
    }

    // ---- Script ----

    @Test
    void aScriptBecomesAScriptFlowWithASchedulerSourceTheScriptAndAnErrorHandler() {
        String script = "def x = 1\nlog.info(\"x=${x}\")";

        FlowImportResultDTO result = flowImportService.importScript(integrationId, script, "Groovy", "Nightly Job");

        assertThat(result.type()).isEqualTo("script");
        assertThat(result.name()).isEqualTo("Nightly Job");
        assertThat(result.warnings()).isEmpty();

        List<Step> steps = stepsOf(result);
        assertThat(steps).extracting(Step::getStepType).containsExactly(StepType.SOURCE, StepType.SCRIPT, StepType.ERROR);
        assertThat(steps.get(0).getComponentType()).isEqualTo("scheduler");
        assertThat(steps.get(0).getUri()).isEqualTo("nightly-job");
        assertThat(steps.get(1).getComponentType()).isEqualTo("groovy");
        assertThat(steps.get(1).getUri()).isEqualTo(script);
        assertThat(steps.get(2).getComponentType()).isEqualTo("log");
        assertThat(steps.get(2).getUri()).isEqualTo("Nightly Job/" + result.flowId());
        assertThat(steps.get(2).getOptions()).isEqualTo("level=ERROR&showAll=true");
        assertThat(steps.get(0).getLinks()).extracting(Link::getBound).containsExactly("out");
    }

    @Test
    void aScriptWithoutANameGetsOneFromItsLanguage() {
        assertThat(flowImportService.importScript(integrationId, "print('x')", "python", null).name()).isEqualTo("script-python");
        assertThat(flowImportService.importScript(integrationId, "print('y')", "python", " ").name()).isEqualTo("script-python-2");
    }

    @Test
    void aScriptInAnUnknownLanguageIsRefused() {
        assertThatThrownBy(() -> flowImportService.importScript(integrationId, "puts 'x'", "ruby", null))
            .isInstanceOf(FlowImportException.class)
            .hasMessageContaining("Unknown script language 'ruby'")
            .hasMessageContaining("groovy");
    }

    @Test
    void anEmptyScriptIsRefused() {
        assertThatThrownBy(() -> flowImportService.importScript(integrationId, "   ", "groovy", null))
            .isInstanceOf(FlowImportException.class)
            .hasMessageContaining("script is empty");
    }

    @Test
    void aScriptFlowIsExportedAsDilAndImportedAgain() throws Exception {
        FlowImportResultDTO imported = flowImportService.importScript(integrationId, "println 'hello'", "groovy", "hello");

        String exported = dilExport.convertDBToFlowConfiguration(imported.flowId(), "application/xml", false);
        assertThat(exported).contains("println 'hello'");

        FlowImportResultDTO again = flowImportService.importDil(integrationId, "application/xml", exported, true);

        assertThat(again.name()).isEqualTo("hello-2");
        assertThat(again.type()).isEqualTo("script");
    }

    @Test
    void anImportWithoutAnIntegrationGoesIntoTheFirstOne() {
        FlowImportResultDTO result = flowImportService.importScript(null, "println 'x'", "groovy", null);

        Integration first = integrationRepository.findAll().stream().min(Comparator.comparing(Integration::getId)).orElseThrow();
        assertThat(flowRepository.findById(result.flowId()).orElseThrow().getIntegration().getId()).isEqualTo(first.getId());
    }

    private List<Step> stepsOf(FlowImportResultDTO result) {
        return flowRepository.findById(result.flowId()).orElseThrow().getSteps().stream()
            .sorted(Comparator.comparing(Step::getId))
            .toList();
    }

    private String fixture(String name) throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/dil/" + name)) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8).trim();
        }
    }
}
