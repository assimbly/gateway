package org.assimbly.gateway.config.importing;

import org.apache.commons.lang3.StringUtils;
import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.domain.enumeration.LogLevelType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.*;
import org.assimbly.gateway.service.api.ResponseSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class ImportXMLFlows {

    private final Logger log = LoggerFactory.getLogger(ImportXMLFlows.class);

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
	private FlowRepository flowRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private LinkRepository linkRepository;

    @Autowired
    private StepRepository stepRepository;

    private Set<Step> steps;

	public void setFlowsFromXML(Document doc, Long integrationId) throws Exception {

        log.info("Importing flows");

		List<String> flowIds = ImportXMLUtil.getList(doc, "/dil/integrations/integration/flows/flow/id/text()");

		for (String flowId : flowIds) {
			setFlowFromXML(doc, integrationId, flowId);
		}

        log.info("Importing flows finished");

	}

	public void setFlowFromXML(Document doc, Long integrationId, String flowId) throws Exception {

        log.info("Importing flow: {}", flowId);

		XPath xPath = XPathFactory.newInstance().newXPath();
		String flowName = xPath.evaluate("//flows/flow[id='" + flowId + "']/name", doc);
		String flowType = xPath.evaluate("//flows/flow[id='" + flowId + "']/type", doc);
        String flowVersion = xPath.evaluate("//flows/flow[id='" + flowId + "']/version", doc);
        String flowNotes = xPath.evaluate("//flows/flow[id='" + flowId + "']/notes", doc);

        //options
		String flowAutostart = xPath.evaluate("//flows/flow[id='" + flowId + "']/options/autostart", doc);
        String flowParallelProcessing = xPath.evaluate("//flows/flow[id='" + flowId + "']/options/parallelProcessing", doc);
		String flowMaximumRedeliveries = xPath.evaluate("//flows/flow[id='" + flowId + "']/options/maximumRedeliveries", doc);
		String flowRedeliveryDelay = xPath.evaluate("//flows/flow[id='" + flowId + "']/options/redeliveryDelay", doc);
		String flowLogLevel = xPath.evaluate("//flows/flow[id='" + flowId + "']/options/logLevel", doc);
        String flowLastModified = xPath.evaluate("//flows/flow[id='" + flowId + "']/options/lastModified", doc);

		if (!flowId.isEmpty() && !flowName.isEmpty()) {

            Optional<Flow> flowOptional = flowRepository.findByName(flowName);
            Optional<Integration> integrationOptional = integrationRepository.findById(integrationId);

            Flow flow;
            if (flowOptional.isEmpty()) {
				flow = new Flow();

                steps = getStepsFromXML(flowId, doc, flow, true);

			} else {
				flow = flowOptional.get();
				steps = getStepsFromXML(flow.getId().toString(), doc, flow, false);
			}

            if (integrationOptional.isEmpty()) {
                log.warn("Integration not found: {}", integrationId);
				return;
			} else {
                Integration integration = integrationOptional.get();
				flow.setIntegration(integration);
			}

            flow.setName(ImportXMLUtil.setStringValue(flowName, flowId));

			flow.setType(ImportXMLUtil.setStringValue(flowType,"connector"));

			flow.setNotes(ImportXMLUtil.setStringValue(flowNotes,""));

			flow.setAutoStart(ImportXMLUtil.setBooleanValue(flowAutostart));

            flow.setParallelProcessing(ImportXMLUtil.setBooleanValue(flowParallelProcessing));

			flow.setMaximumRedeliveries(ImportXMLUtil.setIntegerValue(flowMaximumRedeliveries, 0));

			flow.setRedeliveryDelay(ImportXMLUtil.setIntegerValue(flowRedeliveryDelay, 3000));

            flow.setVersion(ImportXMLUtil.setIntegerValue(flowVersion, 1));

            if (flowLogLevel != null && !flowLogLevel.isEmpty()) {
				flowLogLevel = flowLogLevel.toUpperCase();
				if(flowLogLevel.equals("ERROR")||flowLogLevel.equals("WARN")||flowLogLevel.equals("INFO")||flowLogLevel.equals("DEBUG")||flowLogLevel.equals("TRACE")) {
					flow.setLogLevel(LogLevelType.valueOf(flowLogLevel));
				}else {
					flow.setLogLevel(LogLevelType.OFF);
				}
			} else {
				flow.setLogLevel(LogLevelType.OFF);
			}

            if (flowLastModified != null) {
                try {
                    LocalDateTime  lastModifiedDateTime = LocalDateTime.parse(flowLastModified);
                    ZoneId zone = ZoneId.of("Europe/Berlin");
                    ZoneOffset zoneOffSet = zone.getRules().getOffset(LocalDateTime.now());
                    Instant lastModified = lastModifiedDateTime.toInstant(zoneOffSet);
                    flow.lastModified(lastModified);
                    flow.created(Instant.now());
                }
                catch (Exception _)
                {
                    flow.lastModified(Instant.now());
                    flow.created(Instant.now());
                }
            } else {
                flow.lastModified(Instant.now());
                flow.created(Instant.now());
            }

            flow.setSteps(steps);

            flow = flowRepository.save(flow);

            // Steps are not cascaded on persist, and Links are named after Step ids
            flow.setSteps(new HashSet<>(stepRepository.saveAll(flow.getSteps())));

            flow = setLinks(doc, flowId, flow);

            flowRepository.save(flow);

            log.info("Importing flow finished: " + flowId);

        } else {
            log.warn("Flow not found: {}", flowId);
        }

	}

	private Set<Step> getStepsFromXML(String id, Document doc, Flow flow, boolean newFlow)
			throws Exception {

		if (newFlow) {

            steps = new HashSet<>();
			XPath xPath = XPathFactory.newInstance().newXPath();
			int numberOfSteps = Integer.parseInt(xPath.evaluate("count(//flows/flow[id='" + id + "']/steps/step)", doc));
			numberOfSteps = numberOfSteps + 1;

			for (int i = 1; i < numberOfSteps; i++) {
				String index = Integer.toString(i);
                Step step = getStepFromXML(id, doc, flow, null, index);
				steps.add(step);
			}
		} else {

			steps = flow.getSteps();

			Integer index = 1;

			for (Step step : steps) {

                XPath xPath = XPathFactory.newInstance().newXPath();
                id = xPath.evaluate("//flows/flow[name='" + flow.getName() + "']/id", doc);

				step = getStepFromXML(id, doc, flow, step, index.toString());
				steps.add(step);
				index++;
			}

		}

        return steps;
	}

	private Step getStepFromXML(String flowId, Document doc, Flow flow, Step step, String index) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

		String stepXPath = "/dil/integrations/integration/flows/flow[id='" + flowId + "']/steps/step[" + index + "]/";

        String id = xPath.evaluate(stepXPath + "id", doc);
        String name = xPath.evaluate(stepXPath + "name", doc);
        String type = xPath.evaluate(stepXPath + "type", doc);
		String uri = xPath.evaluate(stepXPath + "uri", doc);
		StringBuilder options = new StringBuilder();
		String connectionId = xPath.evaluate(stepXPath + "blocks/block[type='connection']/id", doc);
		String messageId = xPath.evaluate(stepXPath + "blocks/block[type='message']/id", doc);
        String responseIdAsString = xPath.evaluate(stepXPath + "blocks/blockk[type='response']/id", doc);
        String routeIdAsString = xPath.evaluate(stepXPath + "blocks/block[type='route']/id", doc);
        String coordinateX = xPath.evaluate(stepXPath + "coordinates/x", doc);
        String coordinateY = xPath.evaluate(stepXPath + "coordinates/y", doc);

        // get type
		StepType stepType = StepType.valueOf(type.toUpperCase());

        // get componenType & uri
        String componentType = "";
		if(uri.contains(":")){
			String[] uriSplitted = uri.split(":", 2);
			componentType = uriSplitted[0];

			componentType = componentType.replace("-", "");

	        // get uri
			uri = uriSplitted[1];
			while (uri.startsWith("/")) {
				uri = uri.substring(1);
			}
		}

        // A Response exported for the runtime: its settings come back from its generated message.
        ResponseSettings response = responseSettings(doc, uri);
        if (response != null) {
            componentType = "setmessage";
            uri = response.body();
        }

        // get options
		Map<String, String> optionsMap = ImportXMLUtil.getMap(doc, stepXPath + "options/*");

		for (Map.Entry<String, String> entry : optionsMap.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			if (!options.isEmpty()) {
				options.append('&').append(key).append('=').append(value);
            } else {
				options = new StringBuilder(key).append('=').append(value);
			}

		}

        // get connection if configured
		Connection connection;
		try {

            Long connectionIdLong = Long.parseLong(connectionId, 10);

            String connectionName = xPath.evaluate("/dil/core/connections/connection[id=" + connectionIdLong + "]/name",doc);

            Optional<Connection>connectionOptional = connectionRepository.findByName(connectionName);

			if(connectionOptional.isPresent()) {
                connection = connectionOptional.get();
            }else {
                connection = null;
			}
		} catch (NumberFormatException _) {
			connection = null;
		}

		// get message if configured
		Message message;
		try {
			Long messageIdLong = Long.parseLong(messageId, 10);
			String messageName = xPath.evaluate("/dil/core/messages/message[id=" + messageIdLong + "]/name",doc);

            Optional<Message> messageOptional = messageRepository.findByName(messageName);

			if(messageOptional.isPresent()) {
                message = messageOptional.get();
			}else {
				message = null;
			}

		} catch (NumberFormatException _) {
			message = null;
		}

		// get route if configured
        Integer routeId = null;
        if(StringUtils.isNumeric(routeIdAsString)){
            routeId = Integer.parseInt(routeIdAsString);
        }

		//get responseId if configured
        Integer responseId = null;
        if(StringUtils.isNumeric(responseIdAsString)){
            responseId = Integer.parseInt(responseIdAsString);
        }

		if (step == null) {
			step = new Step();
		}

        step.setStepType(stepType);

		step.setComponentType(componentType);
        step.responseId(responseId);
        step.setUri(uri);
		step.setFlow(flow);
		step.setOptions(response != null ? response.toOptions() : options.toString());
        step.setCoordinateX(parseCoordinate(coordinateX));
        step.setCoordinateY(parseCoordinate(coordinateY));



        if (name == null || name.isEmpty()) {
            step.setName(id);
        }else{
            step.setName(name);
        }

		if (connection != null) {
			step.setConnection(connection);
		}
		if (message != null) {
			step.setMessage(message);
		}
		if (routeId != null) {
			step.setRouteId(routeId);
		}
		if(responseId != null){
		    step.setResponseId(responseId);
        }

        return step;

	}

    /**
     * Links are named {flowId}-{downstreamStepId}: every Step has at most one inbound Link,
     * so the name is unique per Link, also for the Branches of a Router.
     * A Link without both ends in this Flow (for example to another Flow) keeps its DIL id.
     */
    public Flow setLinks(Document doc, String flowId, Flow flow) throws XPathExpressionException {

        steps = flow.getSteps();
        XPath xPath = XPathFactory.newInstance().newXPath();

        Map<String, Step> downstreamStepByLinkId = new HashMap<>();
        Set<String> outboundLinkIds = new HashSet<>();

        for (Step step : steps) {
            String stepXPath = getStepXPath(xPath, doc, flowId, step);
            int numberOfLinks = Integer.parseInt(xPath.evaluate("count(" + stepXPath + "links/link)", doc));

            for (int i = 1; i <= numberOfLinks; i++) {
                String linkXpath = stepXPath + "links/link[" + i + "]/";
                String linkBound = xPath.evaluate(linkXpath + "bound", doc);
                String linkId = xPath.evaluate(linkXpath + "id", doc);

                if (linkBound.equals("in")) {
                    downstreamStepByLinkId.put(linkId, step);
                } else if (linkBound.equals("out")) {
                    outboundLinkIds.add(linkId);
                }
            }
        }

        for(Step step: steps) {

            // set links
            Set<Link> links = new HashSet<>();

            String stepXPath = getStepXPath(xPath, doc, flowId, step);

            int numberOfLinks = Integer.parseInt(xPath.evaluate("count(" + stepXPath + "links/link)", doc));

            for (int i = 1; i <= numberOfLinks; i++) {

                String linkIndex = Integer.toString(i);
                String linkXpath =  stepXPath + "links/link[" + linkIndex + "]/";

                String linkBound = xPath.evaluate(linkXpath + "bound", doc);
                String linkPattern = xPath.evaluate(linkXpath + "pattern", doc);
                String linkRule = xPath.evaluate(linkXpath + "rule", doc);
                String linkExpression = xPath.evaluate(linkXpath + "expression", doc);
                String linkLanguage = xPath.evaluate(linkXpath + "language", doc);
                String linkTransport = xPath.evaluate(linkXpath + "transport", doc);
                String linkFormat = xPath.evaluate(linkXpath + "format", doc);
                String linkPoint = xPath.evaluate(linkXpath + "point", doc);

                String linkId = xPath.evaluate(linkXpath + "id", doc);
                String linkName = linkId;

                Step downstreamStep = downstreamStepByLinkId.get(linkId);
                if (flow.getId() != null && downstreamStep != null && outboundLinkIds.contains(linkId)) {
                    linkName = flow.getId() + "-" + downstreamStep.getId();
                }

                Optional<Set<Link>> linkSet = linkRepository.findByName(linkName);



                Link link = null;
                if(linkSet.isPresent()){
                    for (Link existingLink : linkSet.get()) {
                        if(existingLink.getBound().equals(linkBound)){
                            link = existingLink;
                        }
                    }
                    if(link == null){
                        link = new Link();
                    }
                }else{
                    link = new Link();
                }

                link.setName(linkName);
                link.setBound(linkBound);
                link.setPattern(linkPattern);
                link.setRule(linkRule);
                link.setExpression(linkExpression);
                link.setLanguage(linkLanguage);
                link.transport(linkTransport);
                link.setPoint(linkPoint);
                link.setFormat(linkFormat);
                link.setStep(step);

                links.add(link);

            }

            step.setLinks(links);
        }

        return flow;

    }

    /** Whether a message is one the export generated for a Response, named response{stepId}. */
    public static boolean isResponseMessage(String messageId) {
        return messageId != null && messageId.matches("response\\d+");
    }

    /**
     * The settings of a Response, from the message the export generated for it ({@code message:response{stepId}}),
     * or null for any other Step.
     */
    private ResponseSettings responseSettings(Document doc, String path) throws XPathExpressionException {
        String messageName = StringUtils.substringAfter(path, "message:");
        if (!path.startsWith("message:") || !isResponseMessage(messageName)) {
            return null;
        }
        XPath xPath = XPathFactory.newInstance().newXPath();
        String messageXPath = "/dil/core/messages/message[name='" + messageName + "']/";
        String status = ResponseSettings.DEFAULT_STATUS;
        Map<String, String> headers = new LinkedHashMap<>();
        NodeList headerNodes = (NodeList) xPath.evaluate(messageXPath + "headers/header", doc, XPathConstants.NODESET);
        for (int i = 0; i < headerNodes.getLength(); i++) {
            String name = xPath.evaluate("name", headerNodes.item(i));
            String value = xPath.evaluate("value", headerNodes.item(i));
            if (name.equals("CamelHttpResponseCode")) {
                status = value;
            } else {
                headers.put(name, value);
            }
        }
        boolean hasBody = (Boolean) xPath.evaluate("boolean(" + messageXPath + "body)", doc, XPathConstants.BOOLEAN);
        String body = hasBody ? xPath.evaluate(messageXPath + "body/content", doc) : null;
        String language = hasBody ? xPath.evaluate(messageXPath + "body/language", doc) : null;
        return new ResponseSettings(status, body == null || body.isEmpty() ? null : body, language == null || language.isEmpty() ? null : language, headers);
    }

    private Double parseCoordinate(String coordinate) {
        try {
            return coordinate.isEmpty() ? null : Double.valueOf(coordinate);
        } catch (NumberFormatException _) {
            return null;
        }
    }

    private String getStepXPath(XPath xPath, Document doc, String flowId, Step step) throws XPathExpressionException {
        String stepsXPath = "/dil/integrations/integration/flows/flow[id='" + flowId + "']/steps/";
        int stepsWithName = Integer.parseInt(xPath.evaluate("count(" + stepsXPath + "step[name='" + step.getName() + "'])", doc));
        if (stepsWithName > 0) {
            return stepsXPath + "step[name='" + step.getName() + "']/";
        }
        return stepsXPath + "step[id='" + step.getName() + "']/";
    }

}
