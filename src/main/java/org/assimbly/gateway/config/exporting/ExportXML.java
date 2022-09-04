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
	private Element headers;
    private Element routes;
    private Element routeConfigurations;
	private Element flow;

	private String integrationId;
    private String logLevelAsString = "OFF";
    private String flowTypeAsString;
	private String flowNameAsString;

    private List<String> connectionsList;
	private List<String> headersList;
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
        Element isAssimblyHeaders = setElement("assimblyHeaders", flowDB.isAssimblyHeaders().toString(), options);
        Element isParallelProcessing = setElement("parallelProcessing", flowDB.isParallelProcessing().toString(), options);
		Element maximumRedeliveries =  setElement("maximumRedeliveries", Integer.toString(flowDB.getMaximumRedeliveries()), options);
		Element redeliveryDelay =  setElement("redeliveryDelay", Integer.toString(flowDB.getRedeliveryDelay()), options);
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
		setSteps(stepsDB);

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

    public void setSteps(Set<Step> stepsDB) throws Exception {

        Element steps = setElement("steps", null, flow);

		for (Step stepDB : stepsDB) {

			String confId = Long.toString(stepDB.getId());
			String flowId = Long.toString(stepDB.getFlow().getId());
			String confUri = stepDB.getUri();
			String confStepType = stepDB.getStepType().getStep();
			String confComponentType = stepDB.getComponentType();
			String confOptions = stepDB.getOptions();
			Connection confConnection = stepDB.getConnection();

			Element step = setElement("step", null, steps);

			Element id =  setElement("id", confId, step);
			Element type =  setElement("type", confStepType, step);

            if(confUri!=null && !confUri.isEmpty()){
                confUri = createUri(confUri, confComponentType, confOptions, confConnection);
                Element uri =  setElement("uri", confUri, step);
			}

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
        }

	}

    public void setBlocks(String flowId, String confId, Step stepDB, Element step) throws Exception {

        Element blocks = setElement("blocks", null, step);

        Integer confRouteId = stepDB.getRouteId();
        Connection confConnection = stepDB.getConnection();
        Header confHeader = stepDB.getHeader();
        Integer confResponseId = stepDB.getResponseId();
        String confStepType = stepDB.getStepType().getStep();

        Element block = setElement("block", null, blocks);
        Element options = setElement("options", null, block);

            if (confRouteId != null) {
                Element routeId =  setElement("route_id", Integer.toString(confRouteId), options);
            }

            if (confConnection != null) {
                String confConnectionId = confConnection.getId().toString();
                Element connectionId =  setElement("connection_id", confConnectionId, options);

                setConnection(confConnectionId, confStepType, confConnection);
            }

            if (confHeader != null) {
                String confHeaderId = confHeader.getId().toString();
                Element headerId =  setElement("header_id", confHeaderId, options);

                setHeader(confHeaderId, confStepType, confHeader);
            }

            if (confRouteId != null) {
                setRoute(confRouteId,flowId,confId);
            }

            if (confResponseId != null) {
                Element responseId =  setElement("response_id", Integer.toString(confResponseId), options);
            }

            if(confRouteId == null && confConnection == null && confHeader == null && confResponseId == null) {
                step.removeChild(blocks);
            }

    }


    public void setCore(Element core) throws Exception {
        connections = setElement("connections", null, core);
        headers = setElement("headers", null, core);
        routes = setElement("routes", null, core);
        routeConfigurations = setElement("routeConfigurations", null, core);
        environmentVariablesList = setElement("environmentVariables", null, core);

        connectionsList = new ArrayList<String>();
        headersList = new ArrayList<String>();
        routesList = new  ArrayList<String>();

        setEnvironmentVariables(integrationId);

    }

    public void setRoute(Integer routeid, String flowId, String stepId) throws Exception {

        Long routeIdAsLong = routeid.longValue();
        String routeIdAsString = routeid.toString();

        Optional<Route> routeOptional = routeRepository.findById(routeIdAsLong);

        if(routeOptional.isPresent()){

            Route route = routeRepository.findById(routeIdAsLong).get();

            if (!routesList.contains(routeIdAsString)) {

                routesList.add(routeIdAsString);

                String routeContent = route.getContent();

                routeContent = routeContent.replaceAll("&","&amp;");

                routeContent = createLogLines(routeContent);

                if(IntegrationUtil.isXML(routeContent)){
                    Document routeDocument = getRouteDocument(routeContent, routeIdAsString);
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

	public void setHeader(String headerid, String type, Header headerDB) throws Exception {

		if (!headersList.contains(headerid)) {
			headersList.add(headerid);

			Element header =  setElement("header", null, headers);

			Element id =  setElement("id", headerDB.getId().toString(), header);

			Element name =  setElement("name", headerDB.getName(), header);

			Element keys =  setElement("keys", null, header);

			Set<HeaderKeys> headerKeys = headerDB.getHeaderKeys();

			for (HeaderKeys headerKey : headerKeys) {

				String parameterName = headerKey.getKey();
				String parameterValue = headerKey.getValue();
				String parameterType = headerKey.getType();

				Element headerParameter = doc.createElement(parameterName);
				headerParameter.setTextContent(parameterValue);
				headerParameter.setAttribute("type", parameterType);
				keys.appendChild(headerParameter);
			}
		}
	}

    private Document getRouteDocument(String route, String routeId) throws Exception {

        DocumentBuilderFactory dbFactory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = dbFactory.newDocumentBuilder();
        Document routeDocument = builder.parse(new ByteArrayInputStream(route.getBytes()));

        //update the route ID
        NodeList nodes = routeDocument.getElementsByTagName("route");
        for (int idx = 0; idx < nodes.getLength(); idx++) {
            Node node = nodes.item(idx);
            ((Element)node).setAttribute("id",routeId);
        }

        //update the routeConfiguration ID
        nodes = routeDocument.getElementsByTagName("routeConfiguration");
        for (int idx = 0; idx < nodes.getLength(); idx++) {
            Node node = nodes.item(idx);
            ((Element)node).setAttribute("id",routeId);
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

	public String createUri(String confUri, String confComponentType, String confOptions, Connection confConnection) throws Exception {

		componentType = confComponentType.toLowerCase();

		componentType = setDefaultComponentType(componentType);

		if (componentType.equals("sql")) {
			String confConnectionId = confConnection.getId().toString();
			if (confOptions.isEmpty() || confOptions == null) {
				confOptions = "dataSource=" + confConnectionId;
			} else if (!confOptions.contains("dataSource")) {
				confOptions = "&dataSource=" + confConnectionId;
			}
		}

		confUri = componentType + confUri;

		if(confComponentType.equalsIgnoreCase("wastebin")) {
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

		if (componentType.equals("file") || componentType.equals("ftp") || componentType.equals("sftp")
				|| componentType.equals("ftps")) {
			componentType = componentType + "://";
		} else {
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
