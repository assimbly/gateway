package org.assimbly.gateway.config.importing;

import org.apache.commons.lang3.StringUtils;
import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.domain.enumeration.LogLevelType;
import org.assimbly.gateway.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.*;

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

    public String xmlConfiguration;
    public String configuration;

    public String uri;

    private Integration integration;
    private Optional<Integration> integrationOptional;

    private Optional<Flow> flowOptional;
    private Flow flow;

    private Set<Step> steps;
	private Step step;

	public void setFlowsFromXML(Document doc, Long integrationId) throws Exception {

        log.info("Importing flows");

		List<String> flowIds = ImportXMLUtil.getList(doc, "/dil/integrations/integration/flows/flow/id/text()");

		for (String flowId : flowIds) {

            Long id;
			try{
				id = Long.parseLong(flowId, 10);
			}catch (Exception e){
				UUID uniqueKey = UUID.randomUUID();
				id = uniqueKey.getLeastSignificantBits();
            }

			setFlowFromXML(doc, integrationId, flowId, id);

		}

        log.info("Importing flows finished");

	}

	public void setFlowFromXML(Document doc, Long integrationId, String flowIid, Long databaseId) throws Exception {

        log.info("Importing flow: {}", flowIid);

		XPath xPath = XPathFactory.newInstance().newXPath();
		String flowId = xPath.evaluate("//flows/flow[id='" + flowIid + "']/id", doc);
		String flowName = xPath.evaluate("//flows/flow[id='" + flowIid + "']/name", doc);
		String flowType = xPath.evaluate("//flows/flow[id='" + flowIid + "']/type", doc);
        String flowVersion = xPath.evaluate("//flows/flow[id='" + flowIid + "']/version", doc);
        String flowNotes = xPath.evaluate("//flows/flow[id='" + flowIid + "']/notes", doc);

        //options
		String flowAutostart = xPath.evaluate("//flows/flow[id='" + flowIid + "']/options/autostart", doc);
        String flowParallelProcessing = xPath.evaluate("//flows/flow[id='" + flowIid + "']/options/parallelProcessing", doc);
		String flowMaximumRedeliveries = xPath.evaluate("//flows/flow[id='" + flowIid + "']/options/maximumRedeliveries", doc);
		String flowRedeliveryDelay = xPath.evaluate("//flows/flow[id='" + flowIid + "']/options/redeliveryDelay", doc);
		String flowLogLevel = xPath.evaluate("//flows/flow[id='" + flowIid + "']/options/logLevel", doc);
        String flowLastModified = xPath.evaluate("//flows/flow[id='" + flowIid + "']/options/lastModified", doc);

		if (!flowId.isEmpty() && !flowName.isEmpty()) {

            flowOptional = flowRepository.findByName(flowName);
			integrationOptional = integrationRepository.findById(integrationId);

            if (!flowOptional.isPresent()) {
				flow = new Flow();
				//flow.setId(databaseId);

                steps = getStepsFromXML(flowId, doc, flow, true);

			} else {
				flow = flowOptional.get();
				steps = getStepsFromXML(flow.getId().toString(), doc, flow, false);
			}

            if (!integrationOptional.isPresent()) {
                log.warn("Integration not found: {}", integrationId);
				return;
			} else {
				integration = integrationOptional.get();
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
                catch (Exception e)
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

            steps = new HashSet<Step>();
			XPath xPath = XPathFactory.newInstance().newXPath();
			int numberOfSteps = Integer.parseInt(xPath.evaluate("count(//flows/flow[id='" + id + "']/steps/step)", doc));
			numberOfSteps = numberOfSteps + 1;

			for (int i = 1; i < numberOfSteps; i++) {
				String index = Integer.toString(i);
				step = getStepFromXML(id, doc, flow, null, index);
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
		String options = "";
		String connectionId = xPath.evaluate(stepXPath + "blocks/block[type='connection']/id", doc);
		String messageId = xPath.evaluate(stepXPath + "blocks/block[type='message']/id", doc);
        String responseIdAsString = xPath.evaluate(stepXPath + "blocks/blockk[type='response']/id", doc);
        String routeIdAsString = xPath.evaluate(stepXPath + "blocks/block[type='route']/id", doc);

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

        // get options
		Map<String, String> optionsMap = ImportXMLUtil.getMap(doc, stepXPath + "options/*");

		for (Map.Entry<String, String> entry : optionsMap.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			if (options != null && !options.isEmpty()) {
				options = options + "&" + key + "=" + value;
            } else {
				options = key + "=" + value;
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
		} catch (NumberFormatException nfe) {
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

		} catch (NumberFormatException nfe) {
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
		step.setOptions(options);



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

    public Flow setLinks(Document doc, String flowId, Flow flow) throws XPathExpressionException {

        steps = flow.getSteps();
        Map<String,String> linkidMap = new HashMap<String,String>();


        //fill the map
        for(Step step: steps) {

            String stepXPath = "/dil/integrations/integration/flows/flow[id='" + flowId + "']/steps/step[id='" + step.getName() + "']/";

            XPath xPath = XPathFactory.newInstance().newXPath();
            int numberOfLinks = Integer.parseInt(xPath.evaluate("count(" + stepXPath + "links/link)", doc));

            numberOfLinks = numberOfLinks + 1;

            for (int i = 1; i < numberOfLinks; i++) {

                String linkIndex = Integer.toString(i);
                String linkXpath =  stepXPath + "links/link[" + linkIndex + "]/";

                String linkBound = xPath.evaluate(linkXpath + "bound", doc);
                String linkId = xPath.evaluate(linkXpath + "id", doc);

                if(linkBound.equals("out")){
                    linkidMap.put(linkId,flow.getId() + "-" + step.getId());
                }

            }


        }


        for(Step step: steps) {

            // set links
            Set<Link> links = new HashSet<>();

            XPath xPath = XPathFactory.newInstance().newXPath();

            String stepXPath = "/dil/integrations/integration/flows/flow[id='" + flowId + "']/steps/step[name='" + step.getName() + "']";

            int name = Integer.parseInt(xPath.evaluate("count(" + stepXPath + ")", doc));
            if(name == 0){
                stepXPath = "/dil/integrations/integration/flows/flow[id='" + flowId + "']/steps/step[id='" + step.getName() + "']/";
            }

            int numberOfLinks = Integer.parseInt(xPath.evaluate("count(" + stepXPath + "links/link)", doc));

            for (int i = 1; i <= numberOfLinks; i++) {

                String linkIndex = Integer.toString(i);
                String linkXpath =  stepXPath + "links/link[" + linkIndex + "]/";

                String linkBound = xPath.evaluate(linkXpath + "bound", doc);
                String linkPattern = xPath.evaluate(linkXpath + "pattern", doc);
                String linkRule = xPath.evaluate(linkXpath + "rule", doc);
                String linkExpression = xPath.evaluate(linkXpath + "expression", doc);
                String linkTransport = xPath.evaluate(linkXpath + "transport", doc);
                String linkFormat = xPath.evaluate(linkXpath + "format", doc);
                String linkPoint = xPath.evaluate(linkXpath + "point", doc);

                String linkId = xPath.evaluate(linkXpath + "id", doc);
                String linkName = linkId;

                if(flow.getId() != null){
                    if(linkBound.equals("in")){
                        linkName = linkidMap.get(linkId);
                    }else{
                        linkName = flow.getId() + "-" + step.getId();
                    }
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

}
