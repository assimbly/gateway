package org.assimbly.gateway.config.exporting;

import org.apache.commons.lang3.StringUtils;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.*;
import org.assimbly.util.IntegrationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.*;

@Service
@Transactional
public class ExportXML {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

    private final ApplicationProperties applicationProperties;

    public String options;
	public String componentType;
	public String uri;

	@Autowired
	private GatewayRepository gatewayRepository;

	@Autowired
	private FlowRepository flowRepository;

    @Autowired
    private RouteRepository routeRepository;

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	private String xmlConfiguration;

	private Document doc;

    private Set<Step> stepsDB;

    private Node environmentVariablesList;

    private Element flows;
	private Element connections;
	private Element messages;
    private Element routes;
    private Element routeConfigurations;
	private Element flow;

	private String integrationId;
    private String routeConfigurationId;
    private String logLevelAsString = "OFF";
    private String flowTypeAsString;
	private String flowNameAsString;

    private List<String> connectionsList;
	private List<String> messagesList;
    private List<String> routesList;


    public ExportXML(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public String getXMLConfiguration(Long gatewayId) throws Exception {

		setGeneralProperties(gatewayId);

		List<Flow> flows = flowRepository.findAllByGatewayId(gatewayId);

		for (Flow flow : flows) {
			if (flow != null) {
				getXMLFlowConfiguration(flow);
			}
		}

		xmlConfiguration = DocConverter.convertDocToString(doc);

		return xmlConfiguration;
	}

	public String getXMLConfigurationByIds(Long gatewayId, String ids) throws Exception {

		setGeneralProperties(gatewayId);

		List<String> idsList = Arrays.asList(ids.split(","));

		List<Flow> flows = flowRepository.findAllByGatewayId(gatewayId);

		for (Flow flow : flows) {
			if (flow != null) {

				String confId = Long.toString(flow.getId());

				if(idsList.contains(confId)) {
					getXMLFlowConfiguration(flow);
				}
			}
		}

		xmlConfiguration = DocConverter.convertDocToString(doc);

		return xmlConfiguration;
	}


	public String getXMLFlowConfiguration(Long id) throws Exception {

		Flow flow = flowRepository.findById(id).get();
		setGeneralProperties(flow.getGateway().getId());

		// check if steps are configured
		stepsDB = flow.getSteps();

		if (stepsDB == null) {
			throw new Exception("Set of configuration failed. Step cannot be null");
		} else {
			setFlows(flow);
		}

		xmlConfiguration = DocConverter.convertDocToString(doc);

        xmlConfiguration = StringUtils.substringBeforeLast(xmlConfiguration,"</dil>") + "</dil>";

		return xmlConfiguration;
	}

	public String getXMLFlowConfiguration(Flow flow) throws Exception {

		stepsDB = flow.getSteps();

		if (stepsDB == null) {
			throw new Exception("Set of configuration failed. Step cannot be null");
		} else {
			setFlows(flow);
		}

		xmlConfiguration = DocConverter.convertDocToString(doc);

		return xmlConfiguration;

	}


	// set methods
    // These methods set the XML Elements

	public void setGeneralProperties(Long gatewayId) throws Exception {

		integrationId = gatewayId.toString();
		Gateway gateway = gatewayRepository.findById(gatewayId).get();

		DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
		doc = docBuilder.newDocument();

        Element dil = doc.createElement("dil");
        doc.appendChild(dil);

        Element version = setElement("version", applicationProperties.getInfo().getVersion(), dil);
        Element integrations = setElement("integrations", null, dil);
        Element core = setElement("core", null, dil);

        setIntegrations(integrations, gateway);

        setCore(core);

	}

    public void setIntegrations(Element integrations, Gateway gateway) throws Exception {

        Element integration = setElement("integration", null, integrations);

        Element id = setElement("id", integrationId, integration);
        Element name = setElement("name", gateway.getName(), integration);
        Element type = setElement("type", gateway.getType().toString(), integration);

        //Options
        Element options =  setElement("options", null, integration);

        Element environmentName = setElement("environment", gateway.getEnvironmentName(), options);
        Element stage = setElement("stage", gateway.getStage().toString(), options);
        Element defaultFromComponentType = setElement("defaultFromComponentType", gateway.getDefaultFromComponentType(), options);
        Element defaultToComponentType = setElement("defaultToComponentType", gateway.getDefaultToComponentType(), options);
        Element defaultErrorComponentType = setElement("defaultErrorComponentType", gateway.getDefaultErrorComponentType(), options);

        flows = setElement("flows", null, integration);

    }

	public void setFlows(Flow flowDB) throws Exception {

		flow = setElement("flow", null, flows);
        String flowId = flowDB.getId().toString();

		//general
		Element id =  setElement("id", flowDB.getId().toString(), flow);
		Element name =  setElement("name", flowDB.getName(), flow);
		Element type =  setElement("type", flowDB.getType(), flow);
        Element version =  setElement("version", flowDB.getVersion().toString(), flow);

		//options
        Element options =  setElement("options", null, flow);

        Element created =  setElement("created", flowDB.getCreated().toString(), options);
        Element lastModified =  setElement("lastModified", flowDB.getLastModified().toString(), options);
        Element autostart= setElement("autostart", flowDB.isAutoStart().toString(), options);
		Element logLevel =  setElement("logLevel", flowDB.getLogLevel().toString(), options);

        flowNameAsString = flowDB.getName();
        flowTypeAsString = flowDB.getType();
        logLevelAsString = flowDB.getLogLevel().toString();

		//notes
        String flowNotes = flowDB.getNotes();
        if(flowNotes!=null){
            Element notes = setElement("notes", flowNotes, flow);
        }

        // set components
        setDependencies(stepsDB);

		// set steps
		setSteps(flowId, stepsDB);

	}

    public void setDependencies(Set<Step> stepsDB) throws Exception {

        Set<String> dependenciesList = new HashSet<>();

		Element dependencies =  setElement("dependencies", null, flow);

        for (Step stepDB : stepsDB) {

            String dependency = stepDB.getComponentType();

            if(!dependenciesList.contains(dependency)){
                dependenciesList.add(dependency);
				setElement("dependency", dependency, dependencies);
            }
        }
    }

    public void setSteps(String flowId, Set<Step> stepsDB) throws Exception {

        Element steps = setElement("steps", null, flow);

		for (Step stepDB : stepsDB) {
            if(stepDB.getStepType().getStep().equalsIgnoreCase("error")){
                setStep(flowId, steps, stepDB);
            }
        }

        for (Step stepDB : stepsDB) {
            if(!stepDB.getStepType().getStep().equalsIgnoreCase("error")){
                setStep(flowId, steps, stepDB);
            }
        }

	}

    public void setStep(String flowId, Element steps, Step stepDB) throws Exception {

        String confId = Long.toString(stepDB.getId());
        String confUri = stepDB.getUri();
        String confStepType = stepDB.getStepType().getStep();
        String confComponentType = stepDB.getComponentType();
        String confOptions = stepDB.getOptions();
        Connection confConnection = stepDB.getConnection();
        Message confMessage = stepDB.getMessage();

        Element step = setElement("step", null, steps);

        Element id =  setElement("id", confId, step);
        Element type =  setElement("type", confStepType, step);

        confUri = createUri(confUri, confComponentType, confOptions, confConnection, confMessage);
        Element uri =  setElement("uri", confUri, step);

        if (confOptions != null && !confOptions.isEmpty()) {
            Element options =  setElement("options", null, step);

            String[] confOptionsSplitted = confOptions.split("&");

            for (String confOption : confOptionsSplitted) {
                String confOptionKey = confOption.split("=")[0];
                String confOptionValue = StringUtils.substringAfter(confOption, "=");

                Element option =  setElement(confOptionKey, confOptionValue, options);
            }
        }

        setBlocks(flowId, confId, stepDB, step);

        setLinks(flowId, confId, stepDB, step);


    }

    public void setBlocks(String flowId, String confId, Step stepDB, Element step) throws Exception {

        Element blocks = setElement("blocks", null, step);

        String stepId = Long.toString(stepDB.getId());
        Integer confRouteId = stepDB.getRouteId();
        Connection confConnection = stepDB.getConnection();
        Message confMessage = stepDB.getMessage();
        Integer confResponseId = stepDB.getResponseId();
        String confStepType = stepDB.getStepType().getStep();

        Element block = setElement("block", null, blocks);
        Element options = setElement("options", null, block);

            if (confRouteId != null) {

                Optional<Route> routeOptional = getRoute(confRouteId);

                if(routeOptional.isPresent()) {

                    Route route = routeOptional.get();
                    String routeContent = route.getContent();

                    if(routeContent.startsWith("<routeConfiguration")) {
                        Element routeId = setElement("routeconfiguration_id", stepId, options);
                    }else{
                        Element routeId = setElement("route_id", stepId, options);
                    }
                }

            }

            if (confConnection != null) {
                String confConnectionId = confConnection.getId().toString();
                Element connectionId =  setElement("connection_id", confConnectionId, options);

                setConnection(confConnectionId, confStepType, confConnection);
            }

            if (confMessage != null) {
                String confMessageId = confMessage.getId().toString();
                Element messageId =  setElement("message_id", confMessageId, options);

                setMessage(confMessageId, confStepType, confMessage, stepDB);
            }

            if (confRouteId != null) {
                setRoute(confRouteId,flowId,confId);
            }

            if (confResponseId != null) {
                Element responseId =  setElement("response_id", Integer.toString(confResponseId), options);
            }

            if(confRouteId == null && confConnection == null && confMessage == null && confResponseId == null) {
                step.removeChild(blocks);
            }

    }

    public void setLinks(String flowId, String confId, Step stepDB, Element step) throws Exception {

        Set<Link> confLinks = stepDB.getLinks();

        if(!confLinks.isEmpty()){
            Element links = setElement("links", null, step);

            for(Link confLink: confLinks){
                Element link = setElement("link", null, links);
                Element linkId =  setElement("id", confLink.getName(), link);
                Element linkTransport =  setElement("transport", confLink.getTransport(), link);
                Element linkBound =  setElement("bound", confLink.getBound(), link);
            }

        }

    }


    public void setCore(Element core) throws Exception {
        connections = setElement("connections", null, core);
        messages = setElement("messages", null, core);
        routes = setElement("routes", null, core);
        routeConfigurations = setElement("routeConfigurations", null, core);
        environmentVariablesList = setElement("environmentVariables", null, core);

        connectionsList = new ArrayList<String>();
        messagesList = new ArrayList<String>();
        routesList = new  ArrayList<String>();

        setEnvironmentVariables(integrationId);

    }

    public Optional<Route> getRoute(Integer routeId){

        Long routeIdAsLong = routeId.longValue();

        return routeRepository.findById(routeIdAsLong);

    }
    public void setRoute(Integer routeid, String flowId, String stepId) throws Exception {

        String routeIdAsString = routeid.toString();

        Optional<Route> routeOptional = getRoute(routeid);

        if(routeOptional.isPresent()) {

            Route route = routeOptional.get();

            if (!routesList.contains(routeIdAsString)) {

                routesList.add(stepId);

                String routeContent = route.getContent();

                routeContent = routeContent.replaceAll("&","&amp;");

                routeContent = createLogLines(routeContent);

                if(IntegrationUtil.isXML(routeContent)){
                    Document routeDocument = getRouteDocument(routeContent, stepId);
                    Node node = doc.importNode(routeDocument.getDocumentElement(), true);
                    if(routeContent.startsWith("<routeConfiguration")){
                        routeConfigurations.appendChild(node);
                    }else{
                        routes.appendChild(node);
                    }
                }
            }
        }

    }

	public void setConnection(String connectionid, String type, Connection connectionDB) throws Exception {

		if (!connectionsList.contains(connectionid)) {

            connectionsList.add(connectionid);

			Element connection =  setElement("connection", null, connections);

			Element id =  setElement("id", connectionDB.getId().toString(), connection);

			Element name =  setElement("name", connectionDB.getName(), connection);

			Element connectionType =  setElement("type", connectionDB.getType(), connection);

			Element keys =  setElement("keys", null, connection);

			Set<ConnectionKeys> connectionKeys = connectionDB.getConnectionKeys();

			for (ConnectionKeys connectionKey : connectionKeys) {

				String parameterName = connectionKey.getKey();
				String parameterValue = connectionKey.getValue();

				Element connectionParameter =  setElement(parameterName, parameterValue, keys);

			}

		}

	}

	public void setMessage(String messageId, String type, Message messageDB, Step stepDB) throws Exception {

		if (!messagesList.contains(messageId)) {
			messagesList.add(messageId);

			Element message =  setElement("message", null, messages);

			Element id =  setElement("id", messageDB.getId().toString(), message);

			Element name =  setElement("name", messageDB.getName(), message);

            if(stepDB.getComponentType().equalsIgnoreCase("setmessage")){
                Element body =  setElement("body", stepDB.getUri(), message);
            }


			Element keys =  setElement("headers", null, message);

			Set<Header> headers = messageDB.getHeaders();

			for (Header header : headers) {

				String parameterName = header.getKey();
				String parameterValue = header.getValue();
				String parameterType = header.getType();
                String parameterLanguage = header.getLanguage();

				Element headerParameter = doc.createElement(parameterName);
				headerParameter.setTextContent(parameterValue);
				headerParameter.setAttribute("type", parameterType);
                headerParameter.setAttribute("language", parameterLanguage);
                keys.appendChild(headerParameter);
			}
		}
	}

    private Document getRouteDocument(String route, String routeId) throws Exception {

        DocumentBuilderFactory dbFactory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = dbFactory.newDocumentBuilder();
        Document routeDocument = builder.parse(new ByteArrayInputStream(route.getBytes()));


        //update the routeConfiguration ID
        NodeList nodes = routeDocument.getElementsByTagName("routeConfiguration");
        for (int idx = 0; idx < nodes.getLength(); idx++) {
            Node node = nodes.item(idx);
            ((Element)node).setAttribute("id",routeId);

            //set routeConfigurationId to be used when setting routes (this must be set before setting other route steps)
            routeConfigurationId = routeId;
        }

        //update the route ID
        nodes = routeDocument.getElementsByTagName("route");
        for (int idx = 0; idx < nodes.getLength(); idx++) {
            Node node = nodes.item(idx);
            ((Element)node).setAttribute("id",routeId);
            if(routeConfigurationId!=null){
                ((Element)node).setAttribute("routeConfigurationId",routeConfigurationId);
            }
        }


        return routeDocument;

    }

	public void setEnvironmentVariables(String integrationId) throws Exception {

		List<EnvironmentVariables> environmentVariables = environmentVariablesRepository.findAll();

		if (environmentVariables.size() > 0) {

			for (EnvironmentVariables environmentVariable : environmentVariables) {

				Element environmentVariableNode = doc.createElement("environmentVariable");
				environmentVariablesList.appendChild(environmentVariableNode);

				Element environmentKeyNode =  setElement("key", environmentVariable.getKey(), environmentVariableNode);
				Element environmentValueNode =  setElement("value", environmentVariable.getValue(), environmentVariableNode);
				Element environmentEncryptedNode =  setElement("encrypted", environmentVariable.isEncrypted().toString(), environmentVariableNode);

            }
		}

	}

	public String createUri(String confUri, String confComponentType, String confOptions, Connection confConnection, Message confMessage) throws Exception {

		componentType = confComponentType.toLowerCase();

        componentType = setDefaultComponentType(componentType);

        if (componentType.startsWith("sql")) {
			String confConnectionId = confConnection.getId().toString();
			if (confOptions.isEmpty() || confOptions == null) {
				confOptions = "dataSource=" + confConnectionId;
			} else if (!confOptions.contains("dataSource")) {
				confOptions = "&dataSource=" + confConnectionId;
			}
		}else if (componentType.startsWith("setheaders") || componentType.startsWith("setmessage")) {
            if(!confUri.startsWith("message")) {
                confUri = "message:" + confMessage.getId().toString();
            }
        }

        if(confUri!=null) {
            confUri = componentType + confUri;
        }else if(componentType.endsWith(":")){
            confUri = StringUtils.substringBeforeLast(componentType,":");
        }else{
            confUri = componentType;
        }

		if(confComponentType.startsWith("wastebin")) {
			confUri = "mock:wastebin";
		}

        return confUri;
	}

    private String createLogLines(String route){

        if(!logLevelAsString.equalsIgnoreCase("OFF") && flowTypeAsString.equalsIgnoreCase("ESB")){
            String logLine = "<to uri=\"log:" + flowNameAsString + "?showAll=true&amp;multiline=true&amp;level=" + logLevelAsString + "\"/>";

            route = route.replaceAll("<from(.*)/>", "<from$1/>\n" + logLine);
            route = route.replaceAll("</route>", logLine + "\n</route>");
        }

        return route;

    }


	private String setDefaultComponentType(String componentType) {

		if (componentType.equals("file") || componentType.equals("ftp") || componentType.equals("sftp")	|| componentType.equals("ftps")) {
			componentType = componentType + "://";
		} else if(!componentType.isEmpty()) {
			componentType = componentType + ":";
		}

		return componentType;
	}

	private Element setElement(String elementName, String elementValue, Element parent){

		Element element = doc.createElement(elementName);
		if(elementValue != null){
			element.setTextContent(elementValue);
		}

		parent.appendChild(element);

		return element;

	}

}
