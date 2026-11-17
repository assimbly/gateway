package org.assimbly.gateway.config.dil;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.config.importing.Import;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.FlowService;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A Flow's own Variables: kept in a file export and an import, and put in before the global Variables when the Flow
 * goes to the runtime, without the {@code <variables>} element.
 */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class FlowVariablesIntTest {

    private static final String FLOW = "/dil/integrations/integration/flows/flow";

    @Autowired
    private Import dilImport;

    @Autowired
    private Export dilExport;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private EnvironmentVariablesRepository environmentVariablesRepository;

    @Autowired
    private FlowService flowService;

    private final XPath xPath = XPathFactory.newInstance().newXPath();

    private Long flowId;

    @BeforeEach
    void importFlow() throws Exception {
        Integration integration = new Integration();
        integration.setName("flow-variables");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integration = integrationRepository.save(integration);

        globalVariable(integration, "inbox", "/data/global-in");
        globalVariable(integration, "outbox", "/data/out");
        globalVariable(integration, "tenant", "acme");

        dilImport.convertConfigurationToDB(integration.getId(), "application/xml", readFixture("flow-variables.xml"));
        flowId = flowRepository.findByName("FlowVariablesFlow").orElseThrow().getId();
    }

    @Test
    void anImportedFlowKeepsItsVariables() {
        assertThat(flowRepository.findById(flowId).orElseThrow().getVariables())
            .containsExactlyInAnyOrderEntriesOf(Map.of("inbox", "/data/flow-in", "name", "@{tenant}.txt"));
    }

    @Test
    void aFileExportKeepsTheVariablesAndTheReferences() throws Exception {
        Document exported = export(false);

        assertThat(xPath.evaluate("count(" + FLOW + "/variables/variable)", exported)).isEqualTo("2");
        assertThat(xPath.evaluate(FLOW + "/variables/variable[1]/key", exported)).isEqualTo("inbox");
        assertThat(xPath.evaluate(FLOW + "/variables/variable[1]/value", exported)).isEqualTo("/data/flow-in");
        assertThat(xPath.evaluate(FLOW + "/variables/variable[2]/value", exported)).isEqualTo("@{tenant}.txt");
        assertThat(xPath.evaluate(FLOW + "/steps/step[type='source']/uri", exported)).isEqualTo("file://@{inbox}");
    }

    @Test
    void theRuntimeGetsTheFlowValueBeforeTheGlobalOneAndNoVariablesElement() throws Exception {
        Document exported = export(true);

        assertThat(xPath.evaluate(FLOW + "/variables", exported, XPathConstants.NODE)).isNull();
        assertThat(xPath.evaluate(FLOW + "/steps/step[type='source']/uri", exported)).isEqualTo("file:///data/flow-in");
        assertThat(xPath.evaluate(FLOW + "/steps/step[type='sink']/uri", exported)).isEqualTo("file:///data/out");
        assertThat(xPath.evaluate(FLOW + "/steps/step[type='sink']/options/fileName", exported)).isEqualTo("acme.txt");
        assertThat(xPath.evaluate(FLOW + "/steps/step[type='sink']/options/doneFileName", exported)).isEqualTo("@{missing}");
    }

    @Test
    void savingAFlowWithoutVariablesKeepsThem() {
        FlowDTO flow = flowService.findOne(flowId).orElseThrow();
        assertThat(flow.getVariables()).containsEntry("inbox", "/data/flow-in");

        flow.setVariables(null);
        flow.setNotes("changed");
        flowService.save(flow);

        assertThat(flowService.findOne(flowId).orElseThrow().getVariables())
            .containsExactlyInAnyOrderEntriesOf(Map.of("inbox", "/data/flow-in", "name", "@{tenant}.txt"));
    }

    @Test
    void savingAFlowWithVariablesReplacesThem() {
        FlowDTO flow = flowService.findOne(flowId).orElseThrow();

        flow.setVariables(Map.of("outbox", "/data/flow-out"));
        flowService.save(flow);

        assertThat(flowService.findOne(flowId).orElseThrow().getVariables())
            .containsExactlyEntriesOf(Map.of("outbox", "/data/flow-out"));
    }

    private void globalVariable(Integration integration, String key, String value) {
        EnvironmentVariables variable = new EnvironmentVariables();
        variable.setKey(key);
        variable.setValue(value);
        variable.setEncrypted(false);
        variable.setIntegration(integration);
        environmentVariablesRepository.save(variable);
    }

    private Document export(boolean placeholderReplacement) throws Exception {
        String xml = dilExport.convertDBToFlowConfiguration(flowId, "application/xml", placeholderReplacement);
        return DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
    }

    private String readFixture(String fixture) throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/dil/" + fixture)) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8).trim();
        }
    }
}
