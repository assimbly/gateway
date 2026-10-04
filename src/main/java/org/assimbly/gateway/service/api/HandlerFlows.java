package org.assimbly.gateway.service.api;

import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.domain.ApiOperation;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Link;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.LogLevelType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.LinkRepository;
import org.assimbly.gateway.repository.StepRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Builds the Handler Flow of an Operation and keeps its Source in line with the Operation (ADR 0003).
 * The Source is a DIL {@code rest} Source: the runtime serves it as {@code rest:<method>:<path>}.
 */
@Component
public class HandlerFlows {

    /** What a new Script Handler Flow's script does until the user writes one: answer with the request's body. */
    static final String DEFAULT_SCRIPT = "// The request is the message: answer with its body, or set a new one.\n"
        + "// Set the CamelHttpResponseCode header for a status other than 200.\n"
        + "body";

    private final FlowRepository flowRepository;
    private final StepRepository stepRepository;
    private final LinkRepository linkRepository;
    private final ApplicationProperties applicationProperties;

    public HandlerFlows(FlowRepository flowRepository, StepRepository stepRepository, LinkRepository linkRepository,
                        ApplicationProperties applicationProperties) {
        this.flowRepository = flowRepository;
        this.stepRepository = stepRepository;
        this.linkRepository = linkRepository;
        this.applicationProperties = applicationProperties;
    }

    /**
     * A new Handler Flow for the Operation. A Visual one is Operation → Response (200, keep the body), so it answers
     * right away; with {@code withResponse} false it is only the Operation, an open end, which makes it a Draft.
     * A Script one is the Operation and a script.
     */
    public Flow create(ApiOperation operation, Integration integration, String flowType, boolean withResponse) {
        boolean script = "script".equals(flowType);
        Instant now = Instant.now();

        Flow flow = new Flow();
        flow.setName(uniqueName(defaultName(operation)));
        flow.setType(script ? "script" : "flow");
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
        flow = flowRepository.save(flow);

        Step source = newStep(flow, StepType.SOURCE, "rest", null, null, 0d, 0d);
        writeSource(source, operation);
        source = stepRepository.save(source);

        Step errorHandler = newStep(flow, StepType.ERROR, "log", flow.getName() + "/" + flow.getId(), "level=ERROR&showAll=true", null, null);
        stepRepository.save(errorHandler);

        if (script) {
            stepRepository.save(newStep(flow, StepType.SCRIPT, "groovy", DEFAULT_SCRIPT, null, null, null));
            link(source, flow.getId() + "-" + source.getId(), "out");
        } else if (withResponse) {
            Step response = stepRepository.save(newStep(flow, StepType.SINK, "setmessage", null, "status=200", 200d, 0d));
            String name = flow.getId() + "-" + response.getId();
            link(source, name, "out");
            link(response, name, "in");
        }

        return flow;
    }

    /** Rewrites the Handler Flow's Source to serve the Operation's method and full path. */
    public void syncSource(ApiOperation operation) {
        Flow flow = operation.getHandlerFlow();
        Optional<Step> source = flow.getSteps().stream().filter(step -> step.getStepType() == StepType.SOURCE).findFirst();
        Step step = source.orElseGet(() -> newStep(flow, StepType.SOURCE, "rest", null, null, 0d, 0d));
        writeSource(step, operation);
        stepRepository.save(step);
    }

    /**
     * An export gives each Response the Operation's response media type as its Content-Type; after a backup is
     * imported, that header is left to the Operation again, so it follows the Operation's media type.
     */
    public void dropDerivedContentType(ApiOperation operation) {
        for (Step step : operation.getHandlerFlow().getSteps()) {
            if (step.getStepType() != StepType.SINK || !"setmessage".equalsIgnoreCase(step.getComponentType()) || step.getMessage() != null) {
                continue;
            }
            ResponseSettings response = ResponseSettings.of(step.getUri(), step.getOptions());
            Map<String, String> headers = new LinkedHashMap<>(response.headers());
            boolean derived = headers.entrySet().removeIf(header ->
                header.getKey().equalsIgnoreCase("Content-Type") && header.getValue().equals(operation.getResponseMediaType()));
            if (derived) {
                step.setOptions(new ResponseSettings(response.status(), response.body(), response.language(), headers).toOptions());
                stepRepository.save(step);
            }
        }
    }

    /** The path the runtime serves the Operation on, with the tenant's prefix when there is one. */
    public String runtimePath(ApiOperation operation) {
        return ApiPaths.runtimePath(applicationProperties.getGateway().getTenant(),
            ApiPaths.fullPath(operation.getApi().getBasePath(), operation.getPath()));
    }

    private void writeSource(Step source, ApiOperation operation) {
        source.setComponentType("rest");
        source.setUri(null);
        source.setOptions("method=" + operation.getMethod().toLowerCase(Locale.ROOT)
            + "&path=" + runtimePath(operation)
            + "&exchangePattern=InOut");
    }

    /** The operationId, or the method and path such as {@code delete-customers-id}. */
    static String defaultName(ApiOperation operation) {
        if (operation.getOperationId() != null && !operation.getOperationId().isBlank()) {
            return operation.getOperationId().strip();
        }
        String fullPath = ApiPaths.fullPath(operation.getApi().getBasePath(), operation.getPath());
        String words = fullPath.replaceAll("[^A-Za-z0-9]+", "-").replaceAll("^-|-$", "");
        return operation.getMethod().toLowerCase(Locale.ROOT) + (words.isEmpty() ? "" : "-" + words);
    }

    /** Flows are found by name when a backup is imported, so a Handler Flow gets a name no other Flow has. */
    private String uniqueName(String name) {
        String candidate = name;
        for (int n = 2; flowRepository.findFirstByNameOrderByIdAsc(candidate).isPresent(); n++) {
            candidate = name + "-" + n;
        }
        return candidate;
    }

    private static Step newStep(Flow flow, StepType type, String componentType, String uri, String options, Double x, Double y) {
        Step step = new Step();
        step.setStepType(type);
        step.setComponentType(componentType);
        step.setUri(uri);
        step.setOptions(options);
        step.setCoordinateX(x);
        step.setCoordinateY(y);
        flow.addStep(step);
        return step;
    }

    private void link(Step step, String name, String bound) {
        Link link = new Link();
        link.setName(name);
        link.setBound(bound);
        link.setTransport("sync");
        link.setStep(step);
        step.addLink(linkRepository.save(link));
    }
}
