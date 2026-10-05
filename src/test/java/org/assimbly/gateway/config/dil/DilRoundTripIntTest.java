package org.assimbly.gateway.config.dil;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.config.importing.Import;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A DIL Flow imported into the Gateway and exported again keeps what the visual designer relies on:
 * Router Branches (name, Condition, pattern) and Step coordinates.
 */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class DilRoundTripIntTest {

    @Autowired
    private Import dilImport;

    @Autowired
    private Export dilExport;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private FlowRepository flowRepository;

    private final XPath xPath = XPathFactory.newInstance().newXPath();

    @Test
    void contentRouterKeepsItsBranchNamesConditionsAndPatterns() throws Exception {

        Document exported = roundTrip("content-router.xml", "ContentRouterFlow");

        Element router = step(exported, "router");
        NodeList outLinks = links(router, "out");
        assertThat(outLinks.getLength()).isEqualTo(2);

        Element checkBranch = (Element) xPath.evaluate("links/link[bound='out' and rule='check']", router, XPathConstants.NODE);
        assertThat(checkBranch).isNotNull();
        assertThat(text(checkBranch, "language")).isEqualTo("simple");
        assertThat(text(checkBranch, "expression")).isEqualTo("${body} contains 'x'");
        assertThat(text(checkBranch, "pattern")).isEqualTo("InOut");

        Element defaultBranch = (Element) xPath.evaluate("links/link[bound='out' and not(rule)]", router, XPathConstants.NODE);
        assertThat(defaultBranch).isNotNull();
        assertThat(text(defaultBranch, "pattern")).isEqualTo("InOut");
        assertThat(xPath.evaluate("language", defaultBranch, XPathConstants.NODE)).isNull();
        assertThat(xPath.evaluate("expression", defaultBranch, XPathConstants.NODE)).isNull();

        assertThat(inLinkId(stepByUri(exported, "log:check"))).isEqualTo(text(checkBranch, "id"));
        assertThat(inLinkId(stepByUri(exported, "log:default"))).isEqualTo(text(defaultBranch, "id"));
    }

    @Test
    void eachRouterBranchLeadsToItsOwnStep() throws Exception {

        Document exported = roundTrip("content-router.xml", "ContentRouterFlow");

        String checkBranchId = xPath.evaluate("links/link[bound='out' and rule='check']/id", step(exported, "router"));
        String defaultBranchId = xPath.evaluate("links/link[bound='out' and not(rule)]/id", step(exported, "router"));

        assertThat(checkBranchId).isNotEqualTo(defaultBranchId);
        assertThat(stepsWithInLink(exported, checkBranchId)).containsExactly("log:check");
        assertThat(stepsWithInLink(exported, defaultBranchId)).containsExactly("log:default");
    }

    @Test
    void stepsKeepTheirCoordinates() throws Exception {

        Document exported = roundTrip("content-router.xml", "ContentRouterFlow");

        assertThat(xPath.evaluate("coordinates/x", step(exported, "source"))).isEqualTo("40");
        assertThat(xPath.evaluate("coordinates/y", step(exported, "source"))).isEqualTo("120");
        assertThat(xPath.evaluate("coordinates/x", step(exported, "router"))).isEqualTo("280.5");
        assertThat(xPath.evaluate("coordinates/y", step(exported, "router"))).isEqualTo("120");
        assertThat(xPath.evaluate("coordinates", stepByUri(exported, "log:check"), XPathConstants.NODE)).isNull();
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
        "if-router.xml        | IfRouterFlow        | if      | log:sink-if   | simple | ${body} contains 'Test'",
        "split-router.xml     | SplitRouterFlow     | split   | log:sink-part | xpath  | /persons/person",
        "enrich-router.xml    | EnrichRouterFlow    | enrich  | log:sink-enrich |      | ",
    })
    void fixedSlotRouterKeepsItsNamedBranchAndDefaultBranch(String fixture, String flowName, String branch, String branchSink,
                                                             String language, String expression) throws Exception {

        Document exported = roundTrip(fixture, flowName);

        Element router = step(exported, "router");
        assertThat(links(router, "out").getLength()).isEqualTo(2);

        Element namedBranch = (Element) xPath.evaluate("links/link[bound='out' and rule='" + branch + "']", router, XPathConstants.NODE);
        assertThat(namedBranch).isNotNull();
        assertThat(text(namedBranch, "language")).isEqualTo(language == null ? "" : language);
        assertThat(text(namedBranch, "expression")).isEqualTo(expression == null ? "" : expression);
        assertThat(stepsWithInLink(exported, text(namedBranch, "id"))).containsExactly(branchSink);

        String defaultBranchId = xPath.evaluate("links/link[bound='out' and not(rule)]/id", router);
        assertThat(stepsWithInLink(exported, defaultBranchId)).hasSize(1).doesNotContain(branchSink);
    }

    @Test
    void recipientListBranchesStayDistinctAndKeepTheirPatterns() throws Exception {

        Document exported = roundTrip("recipient-router.xml", "RecipientRouterFlow");

        Element router = step(exported, "router");
        NodeList branches = links(router, "out");
        assertThat(branches.getLength()).isEqualTo(3);

        java.util.Map<String, String> patternBySink = new java.util.HashMap<>();
        for (int i = 0; i < branches.getLength(); i++) {
            Element branch = (Element) branches.item(i);
            assertThat(xPath.evaluate("rule", branch, XPathConstants.NODE)).isNull();
            patternBySink.put(stepsWithInLink(exported, text(branch, "id")).getFirst(), text(branch, "pattern"));
        }
        assertThat(patternBySink).containsOnly(
            java.util.Map.entry("log:sink-a", "InOnly"),
            java.util.Map.entry("log:sink-b", "InOnly"),
            java.util.Map.entry("log:sink-c", "InOut"));
    }

    @Test
    void flowWithOnlyAnErrorStepStaysEmpty() throws Exception {

        Document exported = roundTrip("empty-flow.xml", "EmptyFlow");

        NodeList steps = (NodeList) xPath.evaluate("//flow/steps/step", exported, XPathConstants.NODESET);
        assertThat(steps.getLength()).isEqualTo(1);
        assertThat(text((Element) steps.item(0), "type")).isEqualTo("error");
        assertThat(xPath.evaluate("//flow/steps/step/links", exported, XPathConstants.NODE)).isNull();
    }

    private java.util.List<String> stepsWithInLink(Document doc, String linkId) throws Exception {
        NodeList uris = (NodeList) xPath.evaluate("//flow/steps/step[links/link[bound='in' and id='" + linkId + "']]/uri", doc, XPathConstants.NODESET);
        java.util.List<String> result = new java.util.ArrayList<>();
        for (int i = 0; i < uris.getLength(); i++) {
            result.add(uris.item(i).getTextContent());
        }
        return result;
    }

    private Document roundTrip(String fixture, String flowName) throws Exception {

        Integration integration = new Integration();
        integration.setName("roundtrip");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integration = integrationRepository.save(integration);

        dilImport.convertConfigurationToDB(integration.getId(), "application/xml", readFixture(fixture));

        Long flowId = flowRepository.findByName(flowName).orElseThrow().getId();
        String xml = dilExport.convertDBToFlowConfiguration(flowId, "application/xml", false);

        return DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
    }

    private String readFixture(String fixture) throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/dil/" + fixture)) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8).trim();
        }
    }

    private Element step(Document doc, String type) throws Exception {
        return (Element) xPath.evaluate("//flow/steps/step[type='" + type + "']", doc, XPathConstants.NODE);
    }

    private Element stepByUri(Document doc, String uri) throws Exception {
        return (Element) xPath.evaluate("//flow/steps/step[uri='" + uri + "']", doc, XPathConstants.NODE);
    }

    private NodeList links(Element step, String bound) throws Exception {
        return (NodeList) xPath.evaluate("links/link[bound='" + bound + "']", step, XPathConstants.NODESET);
    }

    private String inLinkId(Element step) throws Exception {
        return xPath.evaluate("links/link[bound='in']/id", step);
    }

    private String text(Element element, String child) throws Exception {
        return xPath.evaluate(child, element);
    }
}
