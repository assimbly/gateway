package org.assimbly.gateway.service.importing;

import org.assimbly.gateway.config.importing.Import;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Link;
import org.assimbly.gateway.domain.Route;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.LogLevelType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.repository.LinkRepository;
import org.assimbly.gateway.repository.RouteRepository;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.gateway.service.dto.FlowImportResultDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringReader;
import java.io.StringWriter;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Imports a Flow from a DIL export, from Camel XML (a Route Flow) or from a script (a Script Flow), and says which Flow
 * it became. Route and Script Flows are built the way their editors save them, so they open and export like a Flow made
 * there.
 */
@Service
@Transactional
public class FlowImportService {

    /** The languages the Script editor offers. */
    public static final Set<String> SCRIPT_LANGUAGES = Set.of("groovy", "python", "javascript", "simple", "jslt", "xslt");

    private static final String ERROR_HANDLER_OPTIONS = "level=ERROR&showAll=true";

    private final Logger log = LoggerFactory.getLogger(FlowImportService.class);

    private final Import dilImport;
    private final IntegrationRepository integrationRepository;
    private final FlowRepository flowRepository;
    private final StepRepository stepRepository;
    private final LinkRepository linkRepository;
    private final RouteRepository routeRepository;

    public FlowImportService(Import dilImport, IntegrationRepository integrationRepository, FlowRepository flowRepository,
                             StepRepository stepRepository, LinkRepository linkRepository, RouteRepository routeRepository) {
        this.dilImport = dilImport;
        this.integrationRepository = integrationRepository;
        this.flowRepository = flowRepository;
        this.stepRepository = stepRepository;
        this.linkRepository = linkRepository;
        this.routeRepository = routeRepository;
    }

    /** A Flow from a DIL export; a Flow with the same name is replaced, or with {@code rename} the new one is renamed. */
    public FlowImportResultDTO importDil(Long integrationId, String mediaType, String configuration, boolean rename) {
        Integration integration = integration(integrationId);
        requireContent(configuration, "The file is empty.");
        try {
            return dilImport.importFlow(integration.getId(), mediaType, configuration, rename);
        } catch (FlowImportException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Import of a Flow failed: {}", e.getMessage(), e);
            throw new FlowImportException("The file couldn't be imported as a Flow: " + describe(e), e);
        }
    }

    /**
     * A Route Flow from Camel XML: a {@code <route>}, a {@code <routes>} or a {@code <camelContext>} (also inside Spring
     * {@code <beans>}). Each route becomes a Route Step with its own Route.
     */
    public FlowImportResultDTO importCamel(Long integrationId, String xml, String name) {
        Integration integration = integration(integrationId);
        requireContent(xml, "The file is empty.");

        List<String> warnings = new ArrayList<>();
        List<Element> routeElements = routesIn(parse(xml), warnings);
        if (routeElements.isEmpty()) {
            throw new FlowImportException("The file doesn't contain a Camel route.");
        }

        List<String> routeIds = new ArrayList<>();
        for (int i = 0; i < routeElements.size(); i++) {
            String id = routeElements.get(i).getAttribute("id");
            routeIds.add(id == null || id.isBlank() ? "route-" + (i + 1) : id.strip());
        }

        Flow flow = newFlow("route", integration, flowName(name, routeIds.get(0), "camel-route"));

        List<Step> steps = new ArrayList<>();
        for (int i = 0; i < routeElements.size(); i++) {
            Route route = new Route();
            route.setName(uniqueRouteName(routeIds.get(i)));
            route.setType("xml");
            route.setContent(serialize(routeElements.get(i)));
            route = routeRepository.save(route);

            Step step = newStep(flow, StepType.ROUTE, "", null, null);
            step.setRouteId(route.getId().intValue());
            steps.add(stepRepository.save(step));
        }
        // The Error handler, left empty as the Route editor leaves it
        steps.add(stepRepository.save(newStep(flow, StepType.ERROR, "", null, null)));

        createEditorLinks(flow, steps);

        if (routeElements.size() > 1) {
            warnings.add(routeElements.size() + " routes were imported as " + routeElements.size() + " Route Steps of one Flow: " + String.join(", ", routeIds) + ".");
        }
        return result(flow, warnings);
    }

    /** A Script Flow from a script: a scheduler Source, the script and a logging Error handler. */
    public FlowImportResultDTO importScript(Long integrationId, String script, String language, String name) {
        Integration integration = integration(integrationId);
        requireContent(script, "The script is empty.");

        String lowerCaseLanguage = language == null ? "" : language.strip().toLowerCase(Locale.ROOT);
        if (!SCRIPT_LANGUAGES.contains(lowerCaseLanguage)) {
            throw new FlowImportException("Unknown script language '" + (language == null ? "" : language) + "'. Choose one of: "
                + String.join(", ", SCRIPT_LANGUAGES.stream().sorted().toList()) + ".");
        }

        Flow flow = newFlow("script", integration, flowName(name, null, "script-" + lowerCaseLanguage));

        List<Step> steps = new ArrayList<>();
        steps.add(stepRepository.save(newStep(flow, StepType.SOURCE, "scheduler", schedulerName(flow.getName()), null)));
        steps.add(stepRepository.save(newStep(flow, StepType.SCRIPT, lowerCaseLanguage, script, null)));
        steps.add(stepRepository.save(newStep(flow, StepType.ERROR, "log", flow.getName() + "/" + flow.getId(), ERROR_HANDLER_OPTIONS)));

        createEditorLinks(flow, steps);

        return result(flow, List.of());
    }

    private FlowImportResultDTO result(Flow flow, List<String> warnings) {
        return new FlowImportResultDTO(flow.getId(), flow.getName(), flow.getType(), false, List.copyOf(warnings));
    }

    private Integration integration(Long integrationId) {
        if (integrationId != null) {
            return integrationRepository.findById(integrationId)
                .orElseThrow(() -> new FlowImportException("Integration " + integrationId + " doesn't exist."));
        }
        return integrationRepository.findAll().stream()
            .min(Comparator.comparing(Integration::getId))
            .orElseThrow(() -> new FlowImportException("The Gateway has no integration yet."));
    }

    private static void requireContent(String content, String message) {
        if (content == null || content.isBlank()) {
            throw new FlowImportException(message);
        }
    }

    private Flow newFlow(String type, Integration integration, String name) {
        Instant now = Instant.now();
        Flow flow = new Flow();
        flow.setName(name);
        flow.setType(type);
        flow.setIntegration(integration);
        flow.setAutoStart(false);
        flow.setParallelProcessing(false);
        flow.setMaximumRedeliveries(0);
        flow.setRedeliveryDelay(3000);
        flow.setLogLevel(LogLevelType.OFF);
        flow.setVersion(1);
        flow.setCreated(now);
        flow.setLastModified(now);
        flow.setNotes("");
        return flowRepository.save(flow);
    }

    private static Step newStep(Flow flow, StepType type, String componentType, String uri, String options) {
        Step step = new Step();
        step.setStepType(type);
        step.setComponentType(componentType);
        step.setUri(uri);
        step.setOptions(options);
        flow.addStep(step);
        return step;
    }

    /**
     * The Links the Route and Script editors create when they save: a Source, Action or Route has an outbound Link named
     * after itself, and an Action, Sink or Route an inbound Link named after the Step before it.
     */
    private void createEditorLinks(Flow flow, List<Step> steps) {
        Long previousStepId = null;
        for (Step step : steps) {
            StepType type = step.getStepType();
            if (type == StepType.ACTION || type == StepType.SOURCE || type == StepType.ROUTE) {
                link(step, flow.getId() + "-" + step.getId(), "out");
            }
            if ((type == StepType.ACTION || type == StepType.SINK || type == StepType.ROUTE) && previousStepId != null) {
                link(step, flow.getId() + "-" + previousStepId, "in");
            }
            previousStepId = step.getId();
        }
    }

    private void link(Step step, String name, String bound) {
        Link link = new Link();
        link.setName(name);
        link.setBound(bound);
        link.setTransport("sync");
        link.setStep(step);
        step.addLink(linkRepository.save(link));
    }

    /** The asked-for name, else the fallback id or name, made unique because a Flow is found by name. */
    private String flowName(String name, String fallbackId, String fallback) {
        String base = name != null && !name.isBlank() ? name.strip() : fallbackId != null && !fallbackId.isBlank() ? fallbackId : fallback;
        String candidate = base;
        for (int n = 2; flowRepository.findFirstByNameOrderByIdAsc(candidate).isPresent(); n++) {
            candidate = base + "-" + n;
        }
        return candidate;
    }

    private String uniqueRouteName(String name) {
        String candidate = name;
        for (int n = 2; routeRepository.findByName(candidate).isPresent(); n++) {
            candidate = name + "-" + n;
        }
        return candidate;
    }

    /** A Camel scheduler name: lower case letters, digits and dashes. */
    private static String schedulerName(String flowName) {
        String name = flowName.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        return name.isEmpty() ? "scheduler" : name;
    }

    private static String describe(Exception e) {
        return e.getMessage() == null || e.getMessage().isBlank() ? e.getClass().getSimpleName() : e.getMessage();
    }

    // ---- Camel XML ----

    private static Document parse(String xml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);
            return factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml.strip())));
        } catch (Exception e) {
            throw new FlowImportException("The file isn't valid XML: " + describe(e), e);
        }
    }

    /** The route elements in a {@code route}, {@code routes}, {@code camelContext} or {@code beans} document. */
    private static List<Element> routesIn(Document document, List<String> warnings) {
        Element root = document.getDocumentElement();
        String rootName = localName(root);
        List<Element> routes = new ArrayList<>();
        Set<String> ignored = new LinkedHashSet<>();

        switch (rootName) {
            case "route" -> routes.add(root);
            case "routes", "camelContext" -> collectRoutes(root, routes, ignored);
            case "beans", "blueprint" -> {
                NodeList contexts = root.getElementsByTagNameNS("*", "camelContext");
                for (int i = 0; i < contexts.getLength(); i++) {
                    collectRoutes((Element) contexts.item(i), routes, ignored);
                }
            }
            default -> throw new FlowImportException("The file isn't Camel XML: expected <route>, <routes> or <camelContext> but found <" + rootName + ">.");
        }

        if (!ignored.isEmpty()) {
            warnings.add("Not imported, only routes are: " + String.join(", ", ignored.stream().map(name -> "<" + name + ">").toList()) + ".");
        }
        return routes;
    }

    private static void collectRoutes(Element container, List<Element> routes, Set<String> ignored) {
        for (Node child = container.getFirstChild(); child != null; child = child.getNextSibling()) {
            if (child instanceof Element element) {
                if (localName(element).equals("route")) {
                    routes.add(element);
                } else {
                    ignored.add(localName(element));
                }
            }
        }
    }

    private static String localName(Element element) {
        return element.getLocalName() != null ? element.getLocalName() : element.getTagName();
    }

    private static String serialize(Element element) {
        try {
            TransformerFactory factory = TransformerFactory.newInstance();
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            Transformer transformer = factory.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(element), new StreamResult(writer));
            return writer.toString();
        } catch (Exception e) {
            throw new FlowImportException("The route couldn't be read: " + describe(e), e);
        }
    }
}
