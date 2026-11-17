package org.assimbly.gateway.config.firststart;

import jakarta.annotation.PostConstruct;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Link;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.LogLevelType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.repository.LinkRepository;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.service.dto.BrokerDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.ClassUtils;

import java.time.Instant;

/**
 * Sets up a new Gateway, so a new user has something to start from: the Integration, an example Flow (when the
 * integration module is there) and a default Artemis broker that starts with the Gateway (when the broker module is
 * there). A Gateway is new while it has no Integration yet; setting it up creates one, so this happens only once.
 * <p>
 * It runs before the brokers are autostarted (BrokerResource depends on it), so the default broker starts right away.
 */
@Lazy(false)
@Component("firstStart")
public class FirstStart {

    static final String EXAMPLE_FLOW_NAME = "ExampleFlow";
    static final String EXAMPLE_MESSAGE = "Example flow running";

    private static final String INTEGRATION_MODULE = "org.assimbly.integrationrest.IntegrationRuntime";
    private static final String BROKER_MODULE = "org.assimbly.brokerrest.ManagedBrokerRuntime";

    private static final double COLUMN_WIDTH = 200;

    private final Logger log = LoggerFactory.getLogger(FirstStart.class);

    private final ApplicationProperties applicationProperties;
    private final IntegrationRepository integrationRepository;
    private final FlowRepository flowRepository;
    private final StepRepository stepRepository;
    private final LinkRepository linkRepository;
    private final BrokerService brokerService;
    private final TransactionTemplate transactionTemplate;

    public FirstStart(ApplicationProperties applicationProperties, IntegrationRepository integrationRepository,
                      FlowRepository flowRepository, StepRepository stepRepository, LinkRepository linkRepository,
                      BrokerService brokerService, PlatformTransactionManager transactionManager) {
        this.applicationProperties = applicationProperties;
        this.integrationRepository = integrationRepository;
        this.flowRepository = flowRepository;
        this.stepRepository = stepRepository;
        this.linkRepository = linkRepository;
        this.brokerService = brokerService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @PostConstruct
    void init() {
        if (!applicationProperties.getGateway().getFirstStartSetup()) {
            return;
        }
        try {
            transactionTemplate.executeWithoutResult(status -> {
                if (integrationRepository.count() == 0) {
                    setUp(isPresent(INTEGRATION_MODULE), isPresent(BROKER_MODULE));
                }
            });
        } catch (RuntimeException e) {
            // A Gateway that couldn't be set up still starts; the user then creates a Flow or broker themselves
            log.warn("Could not set up the new Gateway: {}", e.getMessage(), e);
        }
    }

    /** Creates the Integration and, with their modules, the example Flow and the default broker. */
    Integration setUp(boolean withExampleFlow, boolean withDefaultBroker) {
        log.info("New Gateway: creating the Integration{}{}", withExampleFlow ? ", an example Flow" : "", withDefaultBroker ? ", a default broker" : "");

        Integration integration = integrationRepository.save(newIntegration());

        if (withExampleFlow && flowRepository.count() == 0) {
            createExampleFlow(integration);
        }
        if (withDefaultBroker && brokerService.findAll().isEmpty()) {
            brokerService.save(defaultBroker());
        }
        return integration;
    }

    /** The Integration as the Flows page creates it when there is none. */
    private Integration newIntegration() {
        Integration integration = new Integration();
        integration.setName(applicationProperties.getGateway().getName());
        integration.setType(GatewayType.FULL);
        integration.setEnvironmentName("Dev1");
        integration.setStage(EnvironmentType.DEVELOPMENT);
        integration.setDefaultFromComponentType("file");
        integration.setDefaultToComponentType("file");
        integration.setDefaultErrorComponentType("file");
        return integration;
    }

    /** A stopped Visual Flow that logs the example message once each time it is started. */
    private void createExampleFlow(Integration integration) {
        Instant now = Instant.now();
        Flow flow = new Flow();
        flow.setName(EXAMPLE_FLOW_NAME);
        flow.setType("flow");
        flow.setIntegration(integration);
        flow.setAutoStart(false);
        flow.setParallelProcessing(false);
        flow.setMaximumRedeliveries(0);
        flow.setRedeliveryDelay(3000);
        flow.setLogLevel(LogLevelType.OFF);
        flow.setVersion(1);
        flow.setCreated(now);
        flow.setLastModified(now);
        flow.setNotes("An example to start from: it logs \"" + EXAMPLE_MESSAGE + "\" once when started. Start it and check the log.");
        flow = flowRepository.save(flow);

        Step once = saveStep(flow, StepType.SOURCE, "once", "example", "body=" + EXAMPLE_MESSAGE, 0);
        Step logger = saveStep(flow, StepType.SINK, "log", EXAMPLE_FLOW_NAME, "showBody=true", 1);
        saveStep(flow, StepType.ERROR, "log", EXAMPLE_FLOW_NAME + "/" + flow.getId(), "level=ERROR&showAll=true", null);

        link(flow, once, logger);
    }

    private Step saveStep(Flow flow, StepType type, String componentType, String uri, String options, Integer column) {
        Step step = new Step();
        step.setStepType(type);
        step.setComponentType(componentType);
        step.setUri(uri);
        step.setOptions(options);
        if (column != null) {
            step.setCoordinateX(column * COLUMN_WIDTH);
            step.setCoordinateY(0.0);
        }
        flow.addStep(step);
        return stepRepository.save(step);
    }

    /** Both ends of a Link, named {flowId}-{downstreamStepId} as the designer saves them. */
    private void link(Flow flow, Step from, Step to) {
        String name = flow.getId() + "-" + to.getId();
        from.addLink(saveLink(name, "out", from));
        to.addLink(saveLink(name, "in", to));
    }

    private Link saveLink(String name, String bound, Step step) {
        Link link = new Link();
        link.setName(name);
        link.setBound(bound);
        link.setTransport("sync");
        link.setStep(step);
        return linkRepository.save(link);
    }

    /** The broker the Brokers page proposes: Artemis with its default broker.xml, started with the Gateway. */
    private static BrokerDTO defaultBroker() {
        BrokerDTO broker = new BrokerDTO();
        broker.setName("default");
        broker.setType("artemis");
        broker.setConfigurationType("file");
        broker.setAutoStart(true);
        return broker;
    }

    private static boolean isPresent(String className) {
        return ClassUtils.isPresent(className, FirstStart.class.getClassLoader());
    }
}
