package org.assimbly.gateway.config.environment;

import com.jayway.jsonpath.Criteria;
import org.apache.commons.lang3.StringUtils;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.*;

@Service
@Transactional
public class DBExportXMLConfiguration {

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

	private Set<Endpoint> endpoints;

	public String xmlConfiguration;
	private Element integrations;
	private Document doc;
	private Element flows;
	private Element services;
	private Element headers;
    private Element routes;
	private Element flow;
	public String integrationId;

	private List<String> servicesList;
	private List<String> headersList;
    private List<String> routesList;

	public String configuration;

	private Node environmentVariablesList;

    public DBExportXMLConfiguration(ApplicationProperties applicationProperties) {
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

        Element version = doc.createElement("version");
        version.setTextContent(applicationProperties.getInfo().getVersion());
        integrations.appendChild(version);

		Element integration = doc.createElement("integration");
		integrations.appendChild(integration);

		Element id = doc.createElement("id");
		id.appendChild(doc.createTextNode(integrationId));
		integration.appendChild(id);

		Element name = doc.createElement("name");
		name.appendChild(doc.createTextNode(gateway.getName()));
		integration.appendChild(name);

		Element type = doc.createElement("type");
		type.appendChild(doc.createTextNode(gateway.getType().toString()));
		integration.appendChild(type);

		Element environmentName = doc.createElement("environmentName");
		environmentName.appendChild(doc.createTextNode(gateway.getEnvironmentName()));
		integration.appendChild(environmentName);

		Element stage = doc.createElement("stage");
		stage.appendChild(doc.createTextNode(gateway.getStage().toString()));
		integration.appendChild(stage);

		Element defaultFromComponentType = doc.createElement("defaultFromComponentType");
		defaultFromComponentType.appendChild(doc.createTextNode(gateway.getDefaultFromComponentType()));
		integration.appendChild(defaultFromComponentType);

		Element defaultToComponentType = doc.createElement("defaultToComponentType");
		defaultToComponentType.appendChild(doc.createTextNode(gateway.getDefaultToComponentType()));
		integration.appendChild(defaultToComponentType);

		Element defaultErrorComponentType = doc.createElement("defaultErrorComponentType");
		defaultErrorComponentType.appendChild(doc.createTextNode(gateway.getDefaultErrorComponentType()));
		integration.appendChild(defaultErrorComponentType);

		flows = doc.createElement("flows");
		services = doc.createElement("services");
		headers = doc.createElement("headers");
        routes = doc.createElement("routes");
		environmentVariablesList = doc.createElement("environmentVariables");

		integration.appendChild(flows);
		integration.appendChild(services);
		integration.appendChild(headers);
        integration.appendChild(routes);
		integration.appendChild(environmentVariablesList);

		servicesList = new ArrayList<String>();
		headersList = new ArrayList<String>();
		routesList = new  ArrayList<String>();

		setXMLEnvironmentVariablesFromDB(integrationId);

	}

	public void setXMLFlowPropertiesFromDB(Flow flowDB) throws Exception {

		flow = doc.createElement("flow");
		flows.appendChild(flow);

		// set id
		String flowId = flowDB.getId().toString();
		Element id = doc.createElement("id");
		id.appendChild(doc.createTextNode(flowId));
		flow.appendChild(id);

		// set name
		String flowName = flowDB.getName();
		Element name = doc.createElement("name");
		name.appendChild(doc.createTextNode(flowName));
		flow.appendChild(name);

        // set notes
        String flowNotes = flowDB.getNotes();
        if(flowNotes!=null){
            Element notes = doc.createElement("notes");
            notes.appendChild(doc.createTextNode(flowNotes));
            flow.appendChild(notes);
        }

		// set autostart
		String flowAutostart = flowDB.isAutoStart().toString();
		Element autostart = doc.createElement("autostart");
		autostart.appendChild(doc.createTextNode(flowAutostart));
		flow.appendChild(autostart);

        // set assimblyHeaders
        String flowAssimblyHeaders = flowDB.isAssimblyHeaders().toString();
        Element isAssimblyHeaders = doc.createElement("assimblyHeaders");
        isAssimblyHeaders.appendChild(doc.createTextNode(flowAssimblyHeaders));
        flow.appendChild(isAssimblyHeaders);

        // set parallelProcessing
        String flowParallelProcessing = flowDB.isParallelProcessing().toString();
        Element isParallelProcessing = doc.createElement("parallelProcessing");
        isParallelProcessing.appendChild(doc.createTextNode(flowParallelProcessing));
        flow.appendChild(isParallelProcessing);

        // set maximumRedeliveries
		String flowMaximumRedeliveries = Integer.toString(flowDB.getMaximumRedeliveries());
		Element maximumRedeliveries = doc.createElement("maximumRedeliveries");
		maximumRedeliveries.appendChild(doc.createTextNode(flowMaximumRedeliveries));
		flow.appendChild(maximumRedeliveries);

		// set redeliveryDelay
		String flowRedeliveryDelay = Integer.toString(flowDB.getRedeliveryDelay());
		Element redeliveryDelay = doc.createElement("redeliveryDelay");
		redeliveryDelay.appendChild(doc.createTextNode(flowRedeliveryDelay));
		flow.appendChild(redeliveryDelay);

		// set logLevel
		String flowLogLevel = flowDB.getLogLevel().toString();
		Element logLevel = doc.createElement("logLevel");
		logLevel.appendChild(doc.createTextNode(flowLogLevel));
		flow.appendChild(logLevel);

		// set version
		String flowVersion = flowDB.getVersion().toString();
		Element version = doc.createElement("version");
		version.appendChild(doc.createTextNode(flowVersion));
		flow.appendChild(version);

		// set created
		String flowCreated = flowDB.getCreated().toString();
		Element created = doc.createElement("created");
		created.appendChild(doc.createTextNode(flowCreated));
		flow.appendChild(created);

		// set lastModified
		String flowLastModified = flowDB.getLastModified().toString();
		Element lastModified = doc.createElement("lastModified");
		lastModified.appendChild(doc.createTextNode(flowLastModified));
		flow.appendChild(lastModified);

        // set components
        setComponentFromDB(endpoints);

		// set endpoints
		setEndpointsFromDB(endpoints);

	}

    public void setComponentFromDB(Set<Endpoint> endpointsDB) throws Exception {

        Set<String> componentsList = new HashSet<>();

        Element components = doc.createElement("components");
        flow.appendChild(components);

        for (Endpoint endpointDB : endpointsDB) {

            String confComponentType = endpointDB.getComponentType();

            if(!componentsList.contains(confComponentType)){
                componentsList.add(confComponentType);

                Element component = doc.createElement("component");
                component.setTextContent(confComponentType);
                components.appendChild(component);

            }
        }
    }

    public void setEndpointsFromDB(Set<Endpoint> endpointsDB) throws Exception {

        Element endpoints = doc.createElement("endpoints");
        flow.appendChild(endpoints);

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

			if (confUri != null) {

				Element endpoint = doc.createElement("endpoint");
                endpoints.appendChild(endpoint);

				Element id = doc.createElement("id");
				id.setTextContent(confId);
				endpoint.appendChild(id);

				Element type = doc.createElement("type");
				type.setTextContent(confEndpointType);
				endpoint.appendChild(type);

                if (confResponseId != null) {
                    Element resonseId = doc.createElement("response_id");
                    resonseId.setTextContent(Integer.toString(confResponseId));
                    endpoint.appendChild(resonseId);
                }

                if (confRouteId != null) {
                    Element routeId = doc.createElement("route_id");
                    routeId.setTextContent(Integer.toString(confRouteId));
                    endpoint.appendChild(routeId);
                }

                Element uri = doc.createElement("uri");
				confUri = createUri(confUri, confComponentType, confOptions, confService);

				uri.setTextContent(confUri);
				endpoint.appendChild(uri);

				if (confOptions != null && !confOptions.isEmpty()) {
					Element options = doc.createElement("options");
					endpoint.appendChild(options);

					String[] confOptionsSplitted = confOptions.split("&");

					for (String confOption : confOptionsSplitted) {
						String confOptionKey = confOption.split("=")[0];
						String confOptionValue = StringUtils.substringAfter(confOption, "=");

						Element option = doc.createElement(confOptionKey);
						option.setTextContent(confOptionValue);
						options.appendChild(option);
					}
				}

				if (confService != null) {
					String confServiceId = confService.getId().toString();
					Element serviceId = doc.createElement("service_id");

					serviceId.setTextContent(confServiceId);
					endpoint.appendChild(serviceId);
					setXMLServiceFromDB(confServiceId, confEndpointType, confService);
				}

				if (confHeader != null) {
					String confHeaderId = confHeader.getId().toString();
					Element headerId = doc.createElement("header_id");

					endpoint.appendChild(headerId);
					headerId.setTextContent(confHeaderId);
					setXMLHeaderFromDB(confHeaderId, confEndpointType, confHeader);
				}

                if (confRouteId != null) {
                    setXMLRouteFromDB(confRouteId,flowId,confId);
                }

				if (confResponseId != null) {

				    Element responseId = doc.createElement("response_id");

				    endpoint.appendChild(responseId);
				    responseId.setTextContent(Integer.toString(confResponseId));
                }

			}else if(confComponentType.equalsIgnoreCase("wastebin")) {

				Element endpoint = doc.createElement("endpoint");
				flow.appendChild(endpoint);

				Element id = doc.createElement("id");
				id.setTextContent(confId);
				endpoint.appendChild(id);

				Element uri = doc.createElement("uri");

				componentType = confComponentType.toLowerCase();

				confUri = "mock:" + componentType;

				uri.setTextContent(confUri);
				endpoint.appendChild(uri);

				Element type = doc.createElement("type");
				type.setTextContent(confEndpointType);
				endpoint.appendChild(type);

			}

		}
	}


	public void setXMLServiceFromDB(String serviceid, String type, org.assimbly.gateway.domain.Service serviceDB) throws Exception {

		if (!servicesList.contains(serviceid)) {

			servicesList.add(serviceid);

			Element service = doc.createElement("service");
			services.appendChild(service);

			Element id = doc.createElement("id");
			id.appendChild(doc.createTextNode(serviceDB.getId().toString()));
			service.appendChild(id);

			Element name = doc.createElement("name");
			name.appendChild(doc.createTextNode(serviceDB.getName().toString()));
			service.appendChild(name);

			Element serviceType = doc.createElement("type");
			serviceType.appendChild(doc.createTextNode(serviceDB.getType().toString()));
			service.appendChild(serviceType);

			Element keys = doc.createElement("keys");
			service.appendChild(keys);

			Set<ServiceKeys> serviceKeys = serviceDB.getServiceKeys();

			for (ServiceKeys serviceKey : serviceKeys) {

				String parameterName = serviceKey.getKey();
				String parameterValue = serviceKey.getValue();

				Element serviceParameter = doc.createElement(parameterName);
				serviceParameter.setTextContent(parameterValue);
				keys.appendChild(serviceParameter);

			}

		}

	}

	public void setXMLHeaderFromDB(String headerid, String type, Header headerDB) throws Exception {

		if (!headersList.contains(headerid)) {
			headersList.add(headerid);

			Element header = doc.createElement("header");
			headers.appendChild(header);

			Element id = doc.createElement("id");
			id.appendChild(doc.createTextNode(headerDB.getId().toString()));
			header.appendChild(id);

			Element name = doc.createElement("name");
			name.appendChild(doc.createTextNode(headerDB.getName().toString()));
			header.appendChild(name);

			Element keys = doc.createElement("keys");
			header.appendChild(keys);

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

        Long routIdAsLong = routeid.longValue();
        String routIdAsString = routeid.toString();

        Optional<Route> routeOptional = routeRepository.findById(routIdAsLong);

        if(routeOptional.isPresent()){
            Route route = routeRepository.findById(routIdAsLong).get();

            if (!routesList.contains(routIdAsString)) {

                routesList.add(routIdAsString);

                String routeContent = route.getContent();

                routeContent = StringUtils.replace(routeContent,"<route>","<route id=\"" + routIdAsString + "\">");

                DocumentBuilderFactory dbFactory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = dbFactory.newDocumentBuilder();
                Document doc2 = builder.parse(new ByteArrayInputStream(routeContent.getBytes()));

                Node node = doc.importNode(doc2.getDocumentElement(), true);
                routes.appendChild(node);

            }

        }


    }

	public void setXMLEnvironmentVariablesFromDB(String integrationId) throws Exception {

		List<EnvironmentVariables> environmentVariables = environmentVariablesRepository.findAll();

		if (environmentVariables.size() > 0) {

			for (EnvironmentVariables environmentVariable : environmentVariables) {

				Element environmentVariableNode = doc.createElement("environmentVariable");

				environmentVariablesList.appendChild(environmentVariableNode);

				// set environmentVariableKey
				String environmentKey = environmentVariable.getKey();
				Element environmentKeyNode = doc.createElement("key");
				environmentKeyNode.appendChild(doc.createTextNode(environmentKey));
				environmentVariableNode.appendChild(environmentKeyNode);

				// set environmentVariableValue
				String environmentValue = environmentVariable.getValue();
				Element environmentValueNode = doc.createElement("value");
				environmentValueNode.appendChild(doc.createTextNode(environmentValue));
				environmentVariableNode.appendChild(environmentValueNode);

                // set environmentVariableValue
                Boolean environmentEncrypted = environmentVariable.isEncrypted();
                Element environmentEncryptedNode = doc.createElement("encrypted");
                environmentEncryptedNode.appendChild(doc.createTextNode(environmentEncrypted.toString()));
                environmentVariableNode.appendChild(environmentEncryptedNode);

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

			return confUri;
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

}
