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
    private GatewayRepository gatewayRepository;

    @Autowired
	private FlowRepository flowRepository;

    @Autowired
    private HeaderRepository headerRepository;

    @Autowired
    private ConnectionRepository connectionRepository;

    public String xmlConfiguration;
    public String configuration;

    public String options;
    public String componentType;
    public String uri;

    private Gateway gateway;
    private Optional<Gateway> gatewayOptional;

    private Optional<Flow> flowOptional;
    private Flow flow;

    private Set<Step> steps;
	private Step step;

	public String setFlowsFromXML(Document doc, Long integrationId) throws Exception {

        log.info("Importing flows");

		List<String> flowIds = ImportXMLUtil.getList(doc, "/dil/integrations/integration/flows/flow/id/text()");

		for (String flowId : flowIds) {

            log.info("Importing flow: " + flowId);

            Long id;
			try{
				id = Long.parseLong(flowId, 10);
			}catch (Exception e){
				UUID uniqueKey = UUID.randomUUID();
				id = uniqueKey.getLeastSignificantBits();
            }

			setFlowFromXML(doc, integrationId, flowId, id);

            log.info("Importing flow finished: " + flowId);

		}

        log.info("Importing flows finished");

        String result = "ok";

		return result;

	}

	public String setFlowFromXML(Document doc, Long integrationId, String id, Long databaseId) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
		String flowId = xPath.evaluate("//flows/flow[id='" + id + "']/id", doc);
		String flowName = xPath.evaluate("//flows/flow[id='" + id + "']/name", doc);
		String flowType = xPath.evaluate("//flows/flow[id='" + id + "']/type", doc);
        String flowNotes = xPath.evaluate("//flows/flow[id='" + id + "']/notes", doc);
		String flowAutostart = xPath.evaluate("//flows/flow[id='" + id + "']/autostart", doc);
        String flowAssimblyHeaders = xPath.evaluate("//flows/flow[id='" + id + "']/assimblyHeaders", doc);
        String flowParallelProcessing = xPath.evaluate("//flows/flow[id='" + id + "']/parallelProcessing", doc);

		String flowMaximumRedeliveries = xPath.evaluate("//flows/flow[id='" + id + "']/maximumRedeliveries", doc);
		String flowRedeliveryDelay = xPath.evaluate("//flows/flow[id='" + id + "']/redeliveryDelay", doc);
		String flowLogLevel = xPath.evaluate("//flows/flow[id='" + id + "']/logLevel", doc);
        String flowVersion = xPath.evaluate("//flows/flow[id='" + id + "']/version", doc);
        String flowLastModified = xPath.evaluate("//flows/flow[id='" + id + "']/lastModified", doc);

		if (!flowId.isEmpty() && !flowName.isEmpty()) {

			flowOptional = flowRepository.findByName(flowName);
			gatewayOptional = gatewayRepository.findById(integrationId);

			if (!flowOptional.isPresent()) {
				flow = new Flow();
				flow.setId(databaseId);

                steps = getStepsFromXML(flowId, doc, flow, true);

			} else {
				flow = flowOptional.get();
				steps = getStepsFromXML(flow.getId().toString(), doc, flow, false);
			}

			if (!gatewayOptional.isPresent()) {
				return "unknown gateway";
			} else {
				gateway = gatewayOptional.get();
				flow.setGateway(gateway);
			}

			flow.setName(ImportXMLUtil.setStringValue(flowName, flowId));

			flow.setType(ImportXMLUtil.setStringValue(flowType,"connector"));

			flow.setNotes(ImportXMLUtil.setStringValue(flowNotes,""));

			flow.setAutoStart(ImportXMLUtil.setBooleanValue(flowAutostart));

            flow.setAssimblyHeaders(ImportXMLUtil.setBooleanValue(flowAssimblyHeaders));

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

			return "flow imported";

		} else {
			return "unknown flow id";
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

	private Step getStepFromXML(String id, Document doc, Flow flow, Step step, String index) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

		String stepXPath = "/dil/integrations/integration/flows/flow[id='" + id + "']/steps/step[" + index + "]/";

		String type = xPath.evaluate(stepXPath + "type", doc);
		String uri = xPath.evaluate(stepXPath + "uri", doc);
		String options = "";
		String connectionId = xPath.evaluate(stepXPath + "connection_id", doc);
		String headerId = xPath.evaluate(stepXPath + "header_id", doc);
        String responseIdAsString = xPath.evaluate(stepXPath + "response_id", doc);
        String routeIdAsString = xPath.evaluate(stepXPath + "route_id", doc);

        // get type
		StepType stepType = StepType.valueOf(type.toUpperCase());

		// get componenType & uri
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

		// get header if configured
		Header header;
		try {

			Long headerIdLong = Long.parseLong(headerId, 10);
			String headerName = xPath.evaluate("/dil/core/headers/header[id=" + headerIdLong + "]/name",doc);
			Optional<Header> headerOptional = headerRepository.findByName(headerName);
			if(headerOptional.isPresent()) {
				header = headerOptional.get();
			}else {
				header = null;
			}

		} catch (NumberFormatException nfe) {
			header = null;
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
		//step.setFlow(flow);
		step.setOptions(options);

		if (connection != null) {
			step.setConnection(connection);
		}
		if (header != null) {
			step.setHeader(header);
		}
		if (routeId != null) {
			step.setRouteId(routeId);
		}
		if(responseId != null){
		    step.setResponseId(responseId);
        }

        return step;

	}

}
