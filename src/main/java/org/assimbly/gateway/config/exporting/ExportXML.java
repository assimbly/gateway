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
    private String configuration;

	private Document doc;

    private Set<Endpoint> endpoints;

    private Node environmentVariablesList;

    private Element integrations;
    private Element flows;
	private Element services;
	private Element headers;
    private Element routes;
    private Element routeConfigurations;
	private Element flow;

	private String integrationId;
    private String logLevelAsString = "OFF";
    private String flowTypeAsString;
	private String flowNameAsString;

    private List<String> servicesList;
	private List<String> headersList;
    private List<String> routesList;


    public ExportXML(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public String getXMLConfiguration(Long gatewayId) throws Exception {

		setXMLGeneralPropertiesFromDB(gatewayId);

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

		setXMLGeneralPropertiesFromDB(gatewayId);

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
		setXMLGeneralPropertiesFromDB(flow.getGateway().getId());

		// check if endpoints are configured
		endpoints = flow.getEndpoints();

		if (endpoints == null) {
			throw new Exception("Set of configuration failed. Endpoint cannot be null");
		} else {
			setXMLFlowPropertiesFromDB(flow);
		}

		xmlConfiguration = DocConverter.convertDocToString(doc);

		return xmlConfiguration;
	}

	public String getXMLFlowConfiguration(Flow flow) throws Exception {

		endpoints = flow.getEndpoints();

		if (endpoints == null) {
			throw new Exception("Set of configuration failed. Endpoint cannot be null");
		} else {
			setXMLFlowPropertiesFromDB(flow);
		}

		xmlConfiguration = DocConverter.convertDocToString(doc);

		return xmlConfiguration;

	}


	// set methods
	public void setXMLGeneralPropertiesFromDB(Long gatewayId) throws Exception {

		integrationId = gatewayId.toString();
		Gateway gateway = gatewayRepository.findById(gatewayId).get();

		DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
		doc = docBuilder.newDocument();

		integrations = doc.createElement("integrations");
		doc.appendChild(integrations);

		Element version = setElement("version", applicationProperties.getInfo().getVersion(), integrations);

		Element integration = setElement("integration", null, integrations);

		Element id = setElement("id", integrationId, integration);
		Element name = setElement("name", gateway.getName(), integration);
		Element type = setElement("type", gateway.getType().toString(), integration);
		Element environmentName = setElement("type", gateway.getEnvironmentName(), integration);
		Element stage = setElement("stage", gateway.getStage().toString(), integration);

		Element defaultFromComponentType = setElement("defaultFromComponentType", gateway.getDefaultFromComponentType(), integration);
		Element defaultToComponentType = setElement("defaultToComponentType", gateway.getDefaultToComponentType(), integration);
		Element defaultErrorComponentType = setElement("defaultErrorComponentType", gateway.getDefaultErrorComponentType(), integration);

		flows = setElement("flows", null, integration);
		services = setElement("services", null, integration);
		headers = setElement("headers", null, integration);
        routes = setElement("routes", null, integration);
        routeConfigurations = setElement("routeConfigurations", null, integration);
		environmentVariablesList = setElement("environmentVariables", null, integration);

		servicesList = new ArrayList<String>();
		headersList = new ArrayList<String>();
		routesList = new  ArrayList<String>();

		setXMLEnvironmentVariablesFromDB(integrationId);

	}

	public void setXMLFlowPropertiesFromDB(Flow flowDB) throws Exception {

		flow = setElement("flow", null, flows);

		//general
		Element id =  setElement("id", flowDB.getId().toString(), flow);
		Element name =  setElement("name", flowDB.getName(), flow);
		Element type =  setElement("type", flowDB.getType(), flow);
		Element version =  setElement("version", flowDB.getVersion().toString(), flow);
		Element created =  setElement("created", flowDB.getCreated().toString(), flow);
		Element lastModified =  setElement("lastModified", flowDB.getLastModified().toString(), flow);

		//settings
		Element autostart= setElement("autostart", flowDB.isAutoStart().toString(), flow);
        Element isAssimblyHeaders = setElement("assimblyHeaders", flowDB.isAssimblyHeaders().toString(), flow);
        Element isParallelProcessing = setElement("parallelProcessing", flowDB.isParallelProcessing().toString(), flow);
		Element maximumRedeliveries =  setElement("maximumRedeliveries", Integer.toString(flowDB.getMaximumRedeliveries()), flow);
		Element redeliveryDelay =  setElement("redeliveryDelay", Integer.toString(flowDB.getRedeliveryDelay()), flow);
		Element logLevel =  setElement("logLevel", flowDB.getLogLevel().toString(), flow);


        flowNameAsString = flowDB.getName();
        flowTypeAsString = flowDB.getType();
        logLevelAsString = flowDB.getLogLevel().toString();

		//notes
        String flowNotes = flowDB.getNotes();
        if(flowNotes!=null){
            Element notes = setElement("notes", flowNotes, flow);
        }

        // set components
        setComponentsFromDB(endpoints);

		// set endpoints
		setEndpointsFromDB(endpoints);

	}

    public void setComponentsFromDB(Set<Endpoint> endpointsDB) throws Exception {

        Set<String> componentsList = new HashSet<>();

		Element components =  setElement("components", null, flow);

        for (Endpoint endpointDB : endpointsDB) {

            String confComponentType = endpointDB.getComponentType();

            if(!componentsList.contains(confComponentType)){
                componentsList.add(confComponentType);
				Element component =  setElement("component", confComponentType, components);
            }
        }
    }

    public void setEndpointsFromDB(Set<Endpoint> endpointsDB) throws Exception {

        Element endpoints = setElement("endpoints", null, flow);

		for (Endpoint endpointDB : endpointsDB) {

			String confId = Long.toString(endpointDB.getId());
			String flowId = Long.toString(endpointDB.getFlow().getId());
			String confUri = endpointDB.getUri();
            Integer confResponseId = endpointDB.getResponseId();
            Integer confRouteId = endpointDB.getRouteId();
			String confEndpointType = endpointDB.getEndpointType().getEndpoint();
			String confComponentType = endpointDB.getComponentType();
			String confOptions = endpointDB.getOptions();
			org.assimbly.gateway.domain.Service confService = endpointDB.getService();
			Header confHeader = endpointDB.getHeader();

			Element endpoint = setElement("endpoint", null, endpoints);

			Element id =  setElement("id", confId, endpoint);
			Element type =  setElement("type", confEndpointType, endpoint);

			if (confResponseId != null) {
				Element resonseId =  setElement("response_id", Integer.toString(confResponseId), endpoint);
			}

			if (confRouteId != null) {
				Element routeId =  setElement("route_id", Integer.toString(confRouteId), endpoint);
			}

            if(confUri!=null && !confUri.isEmpty()){
                confUri = createUri(confUri, confComponentType, confOptions, confService);
                Element uri =  setElement("uri", confUri, endpoint);
			}

            if (confOptions != null && !confOptions.isEmpty()) {
				Element options =  setElement("options", null, endpoint);

				String[] confOptionsSplitted = confOptions.split("&");

				for (String confOption : confOptionsSplitted) {
					String confOptionKey = confOption.split("=")[0];
					String confOptionValue = StringUtils.substringAfter(confOption, "=");

					Element option =  setElement(confOptionKey, confOptionValue, options);
				}
			}

			if (confService != null) {
				String confServiceId = confService.getId().toString();
				Element serviceId =  setElement("service_id", confServiceId, endpoint);

				setXMLServiceFromDB(confServiceId, confEndpointType, confService);
			}

			if (confHeader != null) {
				String confHeaderId = confHeader.getId().toString();
				Element headerId =  setElement("header_id", confHeaderId, endpoint);

				setXMLHeaderFromDB(confHeaderId, confEndpointType, confHeader);
			}

			if (confRouteId != null) {
				setXMLRouteFromDB(confRouteId,flowId,confId);
			}

			if (confResponseId != null) {
				Element responseId =  setElement("response_id", Integer.toString(confResponseId), endpoint);
			}

        }

	}


	public void setXMLServiceFromDB(String serviceid, String type, org.assimbly.gateway.domain.Service serviceDB) throws Exception {

		if (!servicesList.contains(serviceid)) {

			servicesList.add(serviceid);

			Element service =  setElement("service", null, services);

			Element id =  setElement("id", serviceDB.getId().toString(), service);

			Element name =  setElement("name", serviceDB.getName(), service);

			Element serviceType =  setElement("type", serviceDB.getType(), service);

			Element keys =  setElement("keys", null, service);

			Set<ServiceKeys> serviceKeys = serviceDB.getServiceKeys();

			for (ServiceKeys serviceKey : serviceKeys) {

				String parameterName = serviceKey.getKey();
				String parameterValue = serviceKey.getValue();

				Element serviceParameter =  setElement(parameterName, parameterValue, keys);

			}

		}

	}

	public void setXMLHeaderFromDB(String headerid, String type, Header headerDB) throws Exception {

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

    public void setXMLRouteFromDB(Integer routeid, String flowId, String endpointId) throws Exception {

        System.out.println("1. setRoute routeid" + routeid);

        Long routIdAsLong = routeid.longValue();
        String routIdAsString = routeid.toString();

        Optional<Route> routeOptional = routeRepository.findById(routIdAsLong);

        if(routeOptional.isPresent()){

            Route route = routeRepository.findById(routIdAsLong).get();

            if (!routesList.contains(routIdAsString)) {

                routesList.add(routIdAsString);

                String routeContent = route.getContent();

                routeContent = routeContent.replaceAll("&","&amp;");

                routeContent = createLogLines(routeContent);
                System.out.println("3a. setRoute routecontent" + routeContent);

                if(IntegrationUtil.isXML(routeContent)){
                    Document routeDocument = getRouteDocument(routeContent, routIdAsString);
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

	public void setXMLEnvironmentVariablesFromDB(String integrationId) throws Exception {

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

	public String createUri(String confUri, String confComponentType, String confOptions, org.assimbly.gateway.domain.Service confService) throws Exception {

		componentType = confComponentType.toLowerCase();

		componentType = setDefaultComponentType(componentType);

		if (componentType.equals("sql")) {
			String confServiceId = confService.getId().toString();
			if (confOptions.isEmpty() || confOptions == null) {
				confOptions = "dataSource=" + confServiceId;
			} else if (!confOptions.contains("dataSource")) {
				confOptions = "&dataSource=" + confServiceId;
			}
		}

		confUri = componentType + confUri;

		if(confComponentType.equalsIgnoreCase("wastebin")) {
			confUri = "mock:wastebin";
		}

		return confUri;
	}

    private String createLogLines(String route){

        System.out.println("logLevelAsString=" + logLevelAsString);

        if(!logLevelAsString.equalsIgnoreCase("OFF") && flowTypeAsString.equalsIgnoreCase("ESB")){
            String logLine = "<to uri=\"log:" + flowNameAsString + "?showAll=true&amp;multiline=true&amp;level=" + logLevelAsString + "\"/>";

            System.out.println("1. route=" + route);
            route = route.replaceAll("<from(.*)/>", "<from$1/>\n" + logLine);
            System.out.println("2. route=" + route);
            route = route.replaceAll("</route>", logLine + "\n</route>");
            System.out.println("3. route=" + route);
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
