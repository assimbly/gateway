package org.assimbly.gateway.config.dil;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.gateway.service.api.ApiService;
import org.assimbly.gateway.service.dto.ApiDTO;
import org.assimbly.gateway.service.dto.ApiOperationDTO;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
import java.io.StringReader;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * What a Handler Flow exports to, for the runtime to serve its Operation (docs/specs/rest-api-builder.md, seam D).
 */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class HandlerFlowDilExportIntTest {

    @Autowired
    private ApiService apiService;

    @Autowired
    private Export dilExport;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private StepRepository stepRepository;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private ApplicationProperties applicationProperties;

    private final XPath xPath = XPathFactory.newInstance().newXPath();

    private Long integrationId;

    @BeforeEach
    void createIntegration() {
        Integration integration = new Integration();
        integration.setName("handlers");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integrationId = integrationRepository.save(integration).getId();
    }

    @AfterEach
    void forgetTenant() {
        applicationProperties.getGateway().setTenant(null);
    }

    @Test
    void theOperationExportsAsARestSourceOnItsFullPrefixedPathThatAnswers() throws Exception {
        applicationProperties.getGateway().setTenant("acme");
        Flow flow = handlerFlow("GET", "/{id}");

        Element source = step(export(flow), "source");

        assertThat(text(source, "uri")).isEqualTo("rest");
        assertThat(text(source, "options/method")).isEqualTo("get");
        assertThat(text(source, "options/path")).isEqualTo("/_acme/customers/{id}");
        assertThat(text(source, "options/exchangePattern")).isEqualTo("InOut");
    }

    @Test
    void aResponseExportsAsSetmessageWithItsStatusContentTypeHeadersAndBody() throws Exception {
        Flow flow = handlerFlow("POST", "/");
        Step response = response(flow);
        response.setOptions("status=201&language=simple&header.X-Trace=a%26b%3Dc");
        response.setUri("${body}");
        stepRepository.save(response);

        Document dil = export(flow);

        Element sink = step(dil, "sink");
        String messageName = "response" + response.getId();
        assertThat(text(sink, "uri")).isEqualTo("setmessage:message:" + messageName);
        assertThat(xPath.evaluate("options", sink, XPathConstants.NODE)).isNull();
        assertThat(text(sink, "blocks/block[type='message']/id")).isEqualTo(messageName);

        Element message = (Element) xPath.evaluate("/dil/core/messages/message[name='" + messageName + "']", dil, XPathConstants.NODE);
        assertThat(text(message, "body/content")).isEqualTo("${body}");
        assertThat(text(message, "body/language")).isEqualTo("simple");
        assertThat(headers(message)).containsExactly(
            Map.entry("CamelHttpResponseCode", "201"),
            Map.entry("Content-Type", "application/json"),
            Map.entry("X-Trace", "a&b=c"));
    }

    @Test
    void aResponseThatKeepsTheBodyOnlySetsHeadersAndAHeaderCanOverrideTheContentType() throws Exception {
        Flow flow = handlerFlow("GET", "/");
        Step response = response(flow);
        response.setOptions("status=200&header.content-type=text%2Fplain");
        response.setUri(null);
        stepRepository.save(response);

        Document dil = export(flow);

        Element sink = step(dil, "sink");
        String messageName = "response" + response.getId();
        assertThat(text(sink, "uri")).isEqualTo("setheaders:message:" + messageName);
        Element message = (Element) xPath.evaluate("/dil/core/messages/message[name='" + messageName + "']", dil, XPathConstants.NODE);
        assertThat(xPath.evaluate("body", message, XPathConstants.NODE)).isNull();
        assertThat(headers(message)).containsExactly(
            Map.entry("CamelHttpResponseCode", "200"),
            Map.entry("content-type", "text/plain"));
    }

    @Test
    void callFlowExportsAsAFlowlinkActionThatWaitsForTheAnswer() throws Exception {
        Flow flow = handlerFlow("GET", "/");
        Step callFlow = new Step();
        callFlow.setStepType(StepType.ACTION);
        callFlow.setComponentType("flowlink");
        callFlow.setOptions("transport=sync&targetFlowId=42");
        flow.addStep(callFlow);
        stepRepository.save(callFlow);

        Element action = step(export(flow), "action");

        assertThat(text(action, "uri")).isEqualTo("flowlink");
        assertThat(text(action, "options/targetFlowId")).isEqualTo("42");
        assertThat(text(action, "options/transport")).isEqualTo("sync");
        assertThat(text(action, "options/exchangePattern")).isEqualTo("InOut");
    }

    @Test
    void everyStepHasItsOwnProblemRouteConfigurationThatAnswers500() throws Exception {
        Flow flow = handlerFlow("GET", "/{id}");

        Document dil = export(flow);

        // The runtime adds a Route configuration for each Step that refers to one, so each Step has its own.
        NodeList steps = (NodeList) xPath.evaluate("//flow/steps/step[type!='error']", dil, XPathConstants.NODESET);
        assertThat(steps.getLength()).isEqualTo(2);
        for (int i = 0; i < steps.getLength(); i++) {
            Element step = (Element) steps.item(i);
            String id = "apiproblem" + text(step, "id");
            Element block = (Element) xPath.evaluate("blocks/block[type='routeconfiguration']", step, XPathConstants.NODE);
            assertThat(text(block, "id")).isEqualTo(id);
            assertThat(text(block, "uri")).isEqualTo(id);

            Element configuration = (Element) xPath.evaluate("/dil/core/routeConfigurations/routeConfiguration[@id='" + id + "']", dil, XPathConstants.NODE);
            assertThat(configuration).isNotNull();
            assertThat(text(configuration, "onException/exception")).isEqualTo("java.lang.Exception");
            assertThat(text(configuration, "onException/handled/constant")).isEqualTo("true");
            assertThat(text(configuration, "onException/setHeader[@name='CamelHttpResponseCode']/constant")).isEqualTo("500");
            assertThat(text(configuration, "onException/setHeader[@name='Content-Type']/constant")).isEqualTo("application/problem+json");
            String body = text(configuration, "onException/setBody/simple");
            assertThat(body).contains("\"title\":\"Internal Server Error\"", "\"instance\":\"GET /customers/{id}\"", "\"correlationId\":\"${exchangeId}\"");
            assertThat(body).doesNotContain("exception.message");
        }
        assertThat(((NodeList) xPath.evaluate("/dil/core/routeConfigurations/routeConfiguration", dil, XPathConstants.NODESET)).getLength()).isEqualTo(2);
    }

    @Test
    void aFlowlinkSourceKeepsTheExchangePatternItHas() throws Exception {
        Flow called = plainFlow("called");
        Step source = new Step();
        source.setStepType(StepType.SOURCE);
        source.setComponentType("flowlink");
        source.setOptions("transport=sync");
        called.addStep(source);
        stepRepository.save(source);

        Element exported = step(export(called), "source");

        assertThat(xPath.evaluate("options/exchangePattern", exported, XPathConstants.NODE)).isNull();
    }

    @Test
    void aFlowThatHandlesNoOperationExportsAsBefore() throws Exception {
        Flow plain = plainFlow("plain");
        Step source = new Step();
        source.setStepType(StepType.SOURCE);
        source.setComponentType("rest");
        source.setOptions("method=get&path=/plain");
        plain.addStep(source);
        stepRepository.save(source);

        Document dil = export(plain);

        assertThat(xPath.evaluate("//flow/steps/step/blocks", dil, XPathConstants.NODE)).isNull();
        assertThat(xPath.evaluate("/dil/core/routeConfigurations/routeConfiguration", dil, XPathConstants.NODE)).isNull();
    }

    private Flow handlerFlow(String method, String path) {
        ApiDTO api = apiService.createApi(new ApiDTO(null, "Customers", "/customers", "1.0", null, integrationId, 0, null));
        ApiOperationDTO operation = apiService.createOperation(api.id(), new ApiOperationDTO(null, null, method, path, null, null, null, null,
            null, null, null, List.of(), List.of(), null, null, null));
        return flowRepository.findById(operation.handlerFlowId()).orElseThrow();
    }

    private Flow plainFlow(String name) {
        Flow flow = new Flow();
        flow.setName(name);
        flow.setType("flow");
        flow.setIntegration(integrationRepository.findById(integrationId).orElseThrow());
        flow.setVersion(1);
        flow.setAutoStart(false);
        flow.setLogLevel(org.assimbly.gateway.domain.enumeration.LogLevelType.OFF);
        flow.setCreated(java.time.Instant.now());
        flow.setLastModified(java.time.Instant.now());
        return flowRepository.save(flow);
    }

    private static Step response(Flow flow) {
        return flow.getSteps().stream().filter(s -> s.getStepType() == StepType.SINK).findFirst().orElseThrow();
    }

    private Document export(Flow flow) throws Exception {
        String xml = dilExport.convertDBToFlowConfiguration(flow.getId(), "application/xml", false);
        return DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
    }

    private Element step(Document dil, String type) throws Exception {
        return (Element) xPath.evaluate("//flow/steps/step[type='" + type + "']", dil, XPathConstants.NODE);
    }

    private Map<String, String> headers(Element message) throws Exception {
        NodeList headers = (NodeList) xPath.evaluate("headers/header", message, XPathConstants.NODESET);
        Map<String, String> result = new java.util.LinkedHashMap<>();
        for (int i = 0; i < headers.getLength(); i++) {
            Element header = (Element) headers.item(i);
            assertThat(text(header, "type")).isEqualTo("header");
            result.put(text(header, "name"), text(header, "value"));
        }
        return result;
    }

    private String text(Element element, String path) throws Exception {
        return xPath.evaluate(path, element);
    }
}
