package org.assimbly.gateway.config.firststart;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.service.dto.BrokerDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.StringReader;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** A new Gateway gets an example Flow and a default broker, so a new user has something to start from. */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class FirstStartIntTest {

    @Autowired
    private FirstStart firstStart;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private BrokerService brokerService;

    @Autowired
    private Export dilExport;

    private final XPath xPath = XPathFactory.newInstance().newXPath();

    @BeforeEach
    void aNewGateway() {
        assertThat(integrationRepository.count()).as("a new Gateway has no Integration").isZero();
        assertThat(flowRepository.count()).as("a new Gateway has no Flows").isZero();
        assertThat(brokerService.findAll()).as("a new Gateway has no brokers").isEmpty();
    }

    @Test
    void theExampleFlowIsAStoppedVisualFlow() {
        Integration integration = firstStart.setUp(true, true);

        List<Flow> flows = flowRepository.findAllByIntegrationId(integration.getId());
        assertThat(flows).singleElement().satisfies(flow -> {
            assertThat(flow.getName()).isEqualTo("ExampleFlow");
            assertThat(flow.getType()).isEqualTo("flow");
            assertThat(flow.isAutoStart()).isFalse();
        });
    }

    @Test
    void theExampleFlowSendsTheExampleMessageFromATimerToTheLog() throws Exception {
        Integration integration = firstStart.setUp(true, true);
        Long flowId = flowRepository.findAllByIntegrationId(integration.getId()).get(0).getId();

        Document dil = export(flowId);

        Element timer = step(dil, "source");
        Element setBody = step(dil, "action");
        Element log = step(dil, "sink");
        assertThat(text(timer, "uri")).isEqualTo("timer:example");
        assertThat(text(setBody, "uri")).isEqualTo("setbody");
        assertThat(text(setBody, "options/language")).isEqualTo("constant");
        assertThat(text(setBody, "options/expression")).isEqualTo("Example flow running");
        assertThat(text(log, "uri")).isEqualTo("log:ExampleFlow");
        assertThat(text(log, "options/showBody")).isEqualTo("true");

        assertThat(text(timer, "links/link[bound='out']/id")).isEqualTo(text(setBody, "links/link[bound='in']/id"));
        assertThat(text(setBody, "links/link[bound='out']/id")).isEqualTo(text(log, "links/link[bound='in']/id"));
        assertThat(text(step(dil, "error"), "uri")).isEqualTo("log:ExampleFlow/" + flowId);
    }

    @Test
    void theDefaultBrokerIsArtemisStartedWithTheGateway() {
        firstStart.setUp(true, true);

        assertThat(brokerService.findAll()).singleElement().satisfies(broker -> {
            assertThat(broker.getName()).isEqualTo("default");
            assertThat(broker.getType()).isEqualTo("artemis");
            assertThat(broker.getConfigurationType()).isEqualTo("file");
            assertThat(broker.isAutoStart()).isTrue();
        });
    }

    @Test
    void withoutTheModulesOnlyTheIntegrationIsCreated() {
        Integration integration = firstStart.setUp(false, false);

        assertThat(integrationRepository.findById(integration.getId())).isPresent();
        assertThat(flowRepository.count()).isZero();
        assertThat(brokerService.findAll()).isEmpty();
    }

    @Test
    void anExistingBrokerIsKept() {
        BrokerDTO existing = new BrokerDTO();
        existing.setName("mine");
        existing.setType("classic");
        existing.setConfigurationType("file");
        existing.setAutoStart(false);
        brokerService.save(existing);

        firstStart.setUp(true, true);

        assertThat(brokerService.findAll()).extracting(BrokerDTO::getName).containsExactly("mine");
    }

    private Document export(Long flowId) throws Exception {
        String xml = dilExport.convertDBToFlowConfiguration(flowId, "application/xml", false);
        return DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
    }

    private Element step(Document doc, String type) throws Exception {
        return (Element) xPath.evaluate("//flow/steps/step[type='" + type + "']", doc, XPathConstants.NODE);
    }

    private String text(Element element, String path) throws Exception {
        return xPath.evaluate(path, element);
    }
}
