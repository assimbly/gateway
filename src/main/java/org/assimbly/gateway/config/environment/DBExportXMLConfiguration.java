package org.assimbly.gateway.config.environment;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.domain.Gateway;
import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.ServiceKeys;
import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.domain.WireTapEndpoint;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.repository.WireTapEndpointRepository;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

@Service
@Transactional
public class DBExportXMLConfiguration {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	public String options;
	public String componentType;
	public String uri;

	@Autowired
	private GatewayRepository gatewayRepository;

	@Autowired
	private FlowRepository flowRepository;

	@Autowired
	private WireTapEndpointRepository wireTapEndpointRepository;

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	private FromEndpoint fromEndpoint;

	private ErrorEndpoint errorEndpoint;

	private Set<ToEndpoint> toEndpoints;

	public String xmlConfiguration;
	private Element rootElement;
	private Document doc;
	private Element flows;
	private Element services;
	private Element headers;
	private Element flow;
	public String connectorId;

	private List<String> servicesList;
	private List<String> headersList;

	public String configuration;

	private Element offloading;

	private Node environmentVariablesList;

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
		getGeneralFlowPropertiesFromDB(flow);

		if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
			throw new Exception("Set of configuration failed. Endpoint cannot be null");
		} else {
			setXMLFlowPropertiesFromDB(flow);
		}

		xmlConfiguration = DocConverter.convertDocToString(doc);

		return xmlConfiguration;
	}

	public String getXMLFlowConfiguration(Flow flow) throws Exception {

		getGeneralFlowPropertiesFromDB(flow);

		if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
			throw new Exception("Set of configuration failed. Endpoint cannot be null");
		} else {
			setXMLFlowPropertiesFromDB(flow);
		}
		xmlConfiguration = DocConverter.convertDocToString(doc);

		return xmlConfiguration;

	}

	private void getGeneralFlowPropertiesFromDB(Flow flow) throws Exception {

		fromEndpoint = flow.getFromEndpoint();
		errorEndpoint = flow.getErrorEndpoint();
		toEndpoints = flow.getToEndpoints();

	}

	// set methods
	public void setXMLGeneralPropertiesFromDB(Long gatewayId) throws Exception {

		connectorId = gatewayId.toString();
		Gateway gateway = gatewayRepository.findById(gatewayId).get();

		DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
		doc = docBuilder.newDocument();

		rootElement = doc.createElement("connectors");
		doc.appendChild(rootElement);

		Element connector = doc.createElement("connector");
		rootElement.appendChild(connector);

		Element id = doc.createElement("id");
		id.appendChild(doc.createTextNode(connectorId));
		connector.appendChild(id);

		Element name = doc.createElement("name");
		name.appendChild(doc.createTextNode(gateway.getName()));
		connector.appendChild(name);

		Element type = doc.createElement("type");
		type.appendChild(doc.createTextNode(gateway.getType().toString()));
		connector.appendChild(type);

		Element environmentName = doc.createElement("environmentName");
		environmentName.appendChild(doc.createTextNode(gateway.getEnvironmentName()));
		connector.appendChild(environmentName);

		Element stage = doc.createElement("stage");
		stage.appendChild(doc.createTextNode(gateway.getStage().toString()));
		connector.appendChild(stage);

		Element defaultFromEndpointType = doc.createElement("defaultFromEndpointType");
		defaultFromEndpointType.appendChild(doc.createTextNode(gateway.getDefaultFromEndpointType()));
		connector.appendChild(defaultFromEndpointType);

		Element defaultToEndpointType = doc.createElement("defaultToEndpointType");
		defaultToEndpointType.appendChild(doc.createTextNode(gateway.getDefaultToEndpointType()));
		connector.appendChild(defaultToEndpointType);

		Element defaultErrorEndpointType = doc.createElement("defaultErrorEndpointType");
		defaultErrorEndpointType.appendChild(doc.createTextNode(gateway.getDefaultErrorEndpointType()));
		connector.appendChild(defaultErrorEndpointType);

		offloading = doc.createElement("offloading");
		flows = doc.createElement("flows");
		services = doc.createElement("services");
		headers = doc.createElement("headers");
		environmentVariablesList = doc.createElement("environmentVariables");

		connector.appendChild(offloading);
		connector.appendChild(flows);
		connector.appendChild(services);
		connector.appendChild(headers);
		connector.appendChild(environmentVariablesList);

		setXMLOffloadingPropertiesFromDB(connectorId);
		setXMLEnvironmentVariablesFromDB(connectorId);

		servicesList = new ArrayList<String>();
		headersList = new ArrayList<String>();

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

		// set autostart
		String flowAutostart = flowDB.isAutoStart().toString();
		Element autostart = doc.createElement("autostart");
		autostart.appendChild(doc.createTextNode(flowAutostart));
		flow.appendChild(autostart);		
		
		// set offloading
		String flowOffloading = flowDB.isOffLoading().toString();
		Element offloading = doc.createElement("offloading");
		offloading.appendChild(doc.createTextNode(flowOffloading));
		flow.appendChild(offloading);
		
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
		
		// set endpoints
		setXMLFromEndpointFromDB(fromEndpoint);
		setXMLToEndpointsFromDB(toEndpoints);
		setXMLErrorEndpointFromDB(errorEndpoint);

	}

	public void setXMLWireTapEndpointFromDB(WireTapEndpoint wireTapEndpointDB) throws Exception {

		String confUri = wireTapEndpointDB.getUri();
		String confcomponentType = wireTapEndpointDB.getType().toString();
		String confOptions = wireTapEndpointDB.getOptions();
		org.assimbly.gateway.domain.Service confService = wireTapEndpointDB.getService();
		Header confHeader = wireTapEndpointDB.getHeader();

		if (confUri != null) {

			Element uri = doc.createElement("uri");
			offloading.appendChild(uri);

			componentType = confcomponentType.toLowerCase();

			componentType = setDefaultComponentType(componentType);

			if (componentType.equals("sql")) {
				String confServiceId = confService.getId().toString();
				if (confOptions.isEmpty() || confOptions == null) {
					confOptions = "dataSource=" + confServiceId;
				} else if (!confOptions.contains("dataSource")) {
					confOptions = "&dataSource=" + confServiceId;
					;
				}
			}

			confUri = componentType + confUri;
			uri.setTextContent(confUri);
			offloading.appendChild(uri);

			if (confOptions != null && !confOptions.isEmpty()) {

				Element options = doc.createElement("options");
				offloading.appendChild(options);

				String[] confOptionsSplitted = confOptions.split("&");

				if (confOptionsSplitted.length > 1) {

					for (String confOption : confOptionsSplitted) {
						String[] confOptionSplitted = confOption.split("=");

						if (confOptionSplitted.length > 0) {
							Element option = doc.createElement(confOptionSplitted[0]);
							option.setTextContent(confOptionSplitted[1]);
							options.appendChild(option);
						}
					}
				} else {

					String[] confOptionSplitted = confOptions.split("=");

					if (confOptionSplitted.length > 0) {
						Element option = doc.createElement(confOptionSplitted[0]);
						option.setTextContent(confOptionSplitted[1]);
						options.appendChild(option);
					}

				}
			}

			if (confService != null) {
				String confServiceId = confService.getId().toString();
				Element serviceId = doc.createElement("service_id");

				serviceId.setTextContent(confServiceId);
				offloading.appendChild(serviceId);
				setXMLServiceFromDB(confServiceId, "wireTap", confService);
			}

			if (confHeader != null) {
				String confHeaderId = confService.getId().toString();
				Element headerId = doc.createElement("service_id");

				offloading.appendChild(headerId);
				headerId.setTextContent(confHeaderId);
				setXMLHeaderFromDB(confHeaderId, "wireTap", confHeader);
			}

		}
	}

	public void setXMLFromEndpointFromDB(FromEndpoint fromEndpointDB) throws Exception {

		String confId = Long.toString(fromEndpointDB.getId());
		String confUri = fromEndpointDB.getUri();
		String confcomponentType = fromEndpointDB.getType().toString();
		String confOptions = fromEndpointDB.getOptions();
		org.assimbly.gateway.domain.Service confService = fromEndpointDB.getService();
		Header confHeader = fromEndpointDB.getHeader();

		if (confUri != null) {

			Element endpoint = doc.createElement("from");
			flow.appendChild(endpoint);

			Element id = doc.createElement("id");
			id.setTextContent(confId);
			endpoint.appendChild(id);

			Element uri = doc.createElement("uri");

			componentType = confcomponentType.toLowerCase();

			componentType = setDefaultComponentType(componentType);

			if (componentType.equals("sql")) {
				String confServiceId = confService.getId().toString();
				if (confOptions.isEmpty() || confOptions == null) {
					confOptions = "dataSource=" + confServiceId;
				} else if (!confOptions.contains("dataSource")) {
					confOptions = "&dataSource=" + confServiceId;
					;
				}
			}

			confUri = componentType + confUri;
			uri.setTextContent(confUri);
			endpoint.appendChild(uri);

			if (confOptions != null && !confOptions.isEmpty()) {

				Element options = doc.createElement("options");
				endpoint.appendChild(options);

				String[] confOptionsSplitted = confOptions.split("&");

				if (confOptionsSplitted.length > 1) {

					for (String confOption : confOptionsSplitted) {
						String[] confOptionSplitted = confOption.split("=");

						if (confOptionSplitted.length > 0) {
							Element option = doc.createElement(confOptionSplitted[0]);
							option.setTextContent(confOptionSplitted[1]);
							options.appendChild(option);
						}
					}
				} else {

					String[] confOptionSplitted = confOptions.split("=");

					if (confOptionSplitted.length > 0) {
						Element option = doc.createElement(confOptionSplitted[0]);
						option.setTextContent(confOptionSplitted[1]);
						options.appendChild(option);
					}

				}
			}

			if (confService != null) {
				String confServiceId = confService.getId().toString();
				Element serviceId = doc.createElement("service_id");

				serviceId.setTextContent(confServiceId);
				endpoint.appendChild(serviceId);
				setXMLServiceFromDB(confServiceId, "from", confService);
			}

			if (confHeader != null) {
				String confHeaderId = confHeader.getId().toString();
				Element headerId = doc.createElement("header_id");

				endpoint.appendChild(headerId);
				headerId.setTextContent(confHeaderId);
				setXMLHeaderFromDB(confHeaderId, "from", confHeader);
			}

		}
	}

	public void setXMLToEndpointsFromDB(Set<ToEndpoint> toEndpointsDB) throws Exception {

		for (ToEndpoint toEndpointDB : toEndpointsDB) {

			String confId = Long.toString(toEndpointDB.getId());
			String confUri = toEndpointDB.getUri();
			String confComponentType = toEndpointDB.getType().toString();
			String confOptions = toEndpointDB.getOptions();
			org.assimbly.gateway.domain.Service confService = toEndpointDB.getService();
			Header confHeader = toEndpointDB.getHeader();

			if (confUri != null) {

				Element endpoint = doc.createElement("to");
				flow.appendChild(endpoint);

				Element id = doc.createElement("id");
				id.setTextContent(confId);
				endpoint.appendChild(id);

				Element uri = doc.createElement("uri");

				componentType = confComponentType.toLowerCase();

				componentType = setDefaultComponentType(componentType);

				if (componentType.equals("sql")) {
					String confServiceId = confService.getId().toString();
					if (confOptions.isEmpty() || confOptions == null) {
						confOptions = "dataSource=" + confServiceId;
					} else if (!confOptions.contains("dataSource")) {
						confOptions = "&dataSource=" + confServiceId;
						;
					}
				}

				confUri = componentType + confUri;

				uri.setTextContent(confUri);
				endpoint.appendChild(uri);

				if (confOptions != null && !confOptions.isEmpty()) {
					Element options = doc.createElement("options");
					endpoint.appendChild(options);

					String[] confOptionsSplitted = confOptions.split("&");

					for (String confOption : confOptionsSplitted) {
						String[] confOptionSplitted = confOption.split("=");

						if (confOptionSplitted.length > 1) {
							Element option = doc.createElement(confOptionSplitted[0]);
							option.setTextContent(confOptionSplitted[1]);
							options.appendChild(option);
						}
					}
				}

				if (confService != null) {
					String confServiceId = confService.getId().toString();
					Element serviceId = doc.createElement("service_id");

					serviceId.setTextContent(confServiceId);
					endpoint.appendChild(serviceId);
					setXMLServiceFromDB(confServiceId, "to", confService);
				}

				if (confHeader != null) {
					String confHeaderId = confHeader.getId().toString();
					Element headerId = doc.createElement("header_id");

					endpoint.appendChild(headerId);
					headerId.setTextContent(confHeaderId);
					setXMLHeaderFromDB(confHeaderId, "to", confHeader);
				}
			}
		}
	}

	public void setXMLErrorEndpointFromDB(ErrorEndpoint errorEndpointDB) throws Exception {

		String confId = Long.toString(errorEndpointDB.getId());
		String confUri = errorEndpointDB.getUri();
		String confcomponentType = errorEndpointDB.getType().toString();
		String confOptions = errorEndpointDB.getOptions();
		org.assimbly.gateway.domain.Service confService = errorEndpointDB.getService();
		Header confHeader = errorEndpointDB.getHeader();

		if (confUri != null) {

			Element endpoint = doc.createElement("error");
			flow.appendChild(endpoint);

			Element id = doc.createElement("id");
			id.setTextContent(confId);
			endpoint.appendChild(id);

			Element uri = doc.createElement("uri");

			componentType = confcomponentType.toLowerCase();

			componentType = setDefaultComponentType(componentType);

			if (componentType.equals("sql")) {
				String confServiceId = confService.getId().toString();
				if (confOptions.isEmpty() || confOptions == null) {
					confOptions = "dataSource=" + confServiceId;
				} else if (!confOptions.contains("dataSource")) {
					confOptions = "&dataSource=" + confServiceId;
					;
				}
			}

			confUri = componentType + confUri;
			uri.setTextContent(confUri);
			endpoint.appendChild(uri);

			if (confOptions != null && !confOptions.isEmpty()) {

				Element options = doc.createElement("options");
				endpoint.appendChild(options);

				String[] confOptionsSplitted = confOptions.split("&");

				for (String confOption : confOptionsSplitted) {
					String[] confOptionSplitted = confOption.split("=");

					if (confOptionSplitted.length > 1) {
						Element option = doc.createElement(confOptionSplitted[0]);
						option.setTextContent(confOptionSplitted[1]);
						options.appendChild(option);
					}
				}
			}

			if (confService != null) {
				String confServiceId = confService.getId().toString();
				Element serviceId = doc.createElement("service_id");

				serviceId.setTextContent(confServiceId);
				endpoint.appendChild(serviceId);
				setXMLServiceFromDB(confServiceId, "error", errorEndpointDB.getService());
			}

			if (confHeader != null) {
				String confHeaderId = confHeader.getId().toString();
				Element headerId = doc.createElement("header_id");

				endpoint.appendChild(headerId);
				headerId.setTextContent(confHeaderId);
				setXMLHeaderFromDB(confHeaderId, "error", errorEndpointDB.getHeader());
			}
		}
	}

	public void setXMLServiceFromDB(String serviceid, String type, org.assimbly.gateway.domain.Service serviceDB)
			throws Exception {

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

	public void setXMLOffloadingPropertiesFromDB(String connectorId) throws Exception {

		List<WireTapEndpoint> wiretapEndpoints = wireTapEndpointRepository.findAll();

		if (wiretapEndpoints.size() > 0) {

			WireTapEndpoint wiretapEndpoint = wiretapEndpoints.get(0);

			// set id
			String offloadingId = wiretapEndpoint.getId().toString();
			Element id = doc.createElement("id");
			id.appendChild(doc.createTextNode(offloadingId));
			offloading.appendChild(id);

			// set name
			String offloadingName = "offloading";
			Element name = doc.createElement("name");
			name.appendChild(doc.createTextNode(offloadingName));
			offloading.appendChild(name);

			setXMLWireTapEndpointFromDB(wiretapEndpoint);
		}
	}

	public void setXMLEnvironmentVariablesFromDB(String connectorId) throws Exception {

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

			}
		}
	}

	private String setDefaultComponentType(String componentType) {

		if (componentType.equals("file") || componentType.equals("ftp") || componentType.equals("sftp")
				|| componentType.equals("ftps")) {
			componentType = componentType + "://";
		} else if (componentType.equals("http") || componentType.equals("http4")) {
			componentType = "http4://";
		} else {
			componentType = componentType + ":";
		}

		return componentType;
	}

}
