package org.assimbly.gateway.config.environment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.domain.Gateway;
import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.ServiceKeys;
import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.domain.enumeration.EndpointType;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.repository.HeaderRepository;
import org.assimbly.gateway.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

@Service
@Transactional
public class DBImportXMLConfiguration {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	public String options;
	public String componentType;
	public String uri;

	@Autowired
	private GatewayRepository gatewayRepository;

	@Autowired
	private FlowRepository flowRepository;

	@Autowired
	private ServiceRepository serviceRepository;

	@Autowired
	private HeaderRepository headerRepository;

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	private FromEndpoint fromEndpoint;

	private ErrorEndpoint errorEndpoint;

	private Set<ToEndpoint> toEndpoints;

	private org.assimbly.gateway.domain.Service service;

	private Header header;
	public String xmlConfiguration;
	public String connectorId;

	public String configuration;

	private ToEndpoint toEndpoint;

	private Set<ServiceKeys> serviceKeys;

	private long serviceIdLong;

	private Set<HeaderKeys> headerKeys;

	private long headerIdLong;

	public void setGatewayFromXML(Document doc, Long connectorId) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
		String gatewayId = xPath.evaluate("//connectors/connector/id", doc);
		String name = xPath.evaluate("//connectors/connector/name", doc);
		String type = xPath.evaluate("//connectors/connector/type", doc);
		String environmentName = xPath.evaluate("//connectors/connector/environmentName", doc);
		String stage = xPath.evaluate("//connectors/connector/stage", doc);
		String defaultFromEndpointType = xPath.evaluate("//connectors/connector/defaultFromEndpointType", doc);
		String defaultToEndpointType = xPath.evaluate("//connectors/connector/defaultToEndpointType", doc);
		String defaultErrorEndpointType = xPath.evaluate("//connectors/connector/defaultErrorEndpointType", doc);

		if (!gatewayId.isEmpty()) {
			Gateway gateway = gatewayRepository.findById(connectorId).get();

			if (gateway == null) {
				gateway = new Gateway();
			}

			gateway.setId(connectorId);
			gateway.setName(name);
			gateway.setEnvironmentName(environmentName);
			gateway.setType(GatewayType.valueOf(type));
			gateway.setStage(EnvironmentType.valueOf(stage));
			gateway.setDefaultFromEndpointType(defaultFromEndpointType);
			gateway.setDefaultToEndpointType(defaultToEndpointType);
			gateway.setDefaultErrorEndpointType(defaultErrorEndpointType);

			// create environment variables
			setEnvironmentVariablesFromXML(doc, connectorId, gateway);

			gatewayRepository.save(gateway);

			// create flows
			setServicesAndHeadersFromXML(doc);

			// create flows
			setFlowsFromXML(doc, connectorId);

		}

	}

	private String setFlowsFromXML(Document doc, Long connectorId) throws Exception {

		List<String> flowIds = getList(doc, "/connectors/connector/flows/flow/id/text()");

		for (String flowId : flowIds) {
			Long id = Long.parseLong(flowId, 10);

			setFlowFromXML(doc, connectorId, id);
		}

		String result = "ok";

		return result;

	}

	public String setFlowFromXML(Document doc, Long connectorId, Long id) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
		String flowId = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/id", doc);
		String flowName = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/name", doc);
		String flowAutostart = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/autostart", doc);
		String flowOffloading = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/offloading", doc);

		if (!flowId.isEmpty()) {

			Flow flow = flowRepository.findById(id).get();
			Gateway gateway = gatewayRepository.findById(connectorId).get();

			if (flow == null) {
				flow = new Flow();
				flow.setId(id);

				fromEndpoint = getFromEndpointFromXML(flowId, doc, null);
				toEndpoints = getToEndpointsFromXML(flowId, doc, flow, true);
				errorEndpoint = getErrorEndpointFromXML(flowId, doc, null);

			} else {

				fromEndpoint = getFromEndpointFromXML(flowId, doc, flow.getFromEndpoint());
				toEndpoints = getToEndpointsFromXML(flowId, doc, flow, false);
				errorEndpoint = getErrorEndpointFromXML(flowId, doc, flow.getErrorEndpoint());
			}

			if (gateway == null) {
				return "unknown gateway";
			} else {
				flow.setGateway(gateway);
			}

			if (flowName == null || flowName.isEmpty()) {
				flow.setName(flowId);
			} else {
				flow.setName(flowName);
			}

			if (flowAutostart != null && flowAutostart.equals("true")) {
				flow.setAutoStart(true);
			} else {
				flow.setAutoStart(false);
			}

			if (flowOffloading != null && flowOffloading.equals("true")) {
				flow.setOffloading(true);
			} else {
				flow.setOffloading(false);
			}

			flow.setFromEndpoint(fromEndpoint);
			flow.setToEndpoints(toEndpoints);
			flow.setErrorEndpoint(errorEndpoint);

			flow = flowRepository.save(flow);

			return "flow imported";

		} else {
			return "unknown flow id";
		}
	}

	public void setServicesAndHeadersFromXML(Document doc) throws Exception {

		// create services
		List<String> serviceIds = getList(doc, "/connectors/connector/services/service/id/text()");
		setServicesFromXML(doc, serviceIds);

		// create headers
		List<String> headerIds = getList(doc, "/connectors/connector/headers/header/id/text()");
		setHeadersFromXML(doc, headerIds);
	}

	private FromEndpoint getFromEndpointFromXML(String id, Document doc, FromEndpoint fromEndpoint) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
		String fromUri = xPath.evaluate("//flows/flow[id='" + id + "']/from/uri", doc);
		String fromServiceId = xPath.evaluate("//flows/flow[id='" + id + "']/from/service_id", doc);
		String fromHeaderId = xPath.evaluate("//flows/flow[id='" + id + "']/from/header_id", doc);
		String fromOptions = null;

		// get type
		String[] fromUriSplitted = fromUri.split(":", 2);
		String fromTypeAsString = fromUriSplitted[0].toUpperCase();
		EndpointType fromType = EndpointType.valueOf(fromTypeAsString);

		// get uri
		fromUri = fromUriSplitted[1];
		while (fromUri.startsWith("/")) {
			fromUri = fromUri.substring(1);
		}

		// get options
		Map<String, String> fromOptionsMap = getMap(doc, "//flows/flow[id='" + id + "']/from/options/*");

		for (Map.Entry<String, String> entry : fromOptionsMap.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			if (fromOptions != null) {
				fromOptions = fromOptions + "&" + key + "=" + value;
				;
			} else {
				fromOptions = key + "=" + value;
			}
		}

		// get service if configured
		org.assimbly.gateway.domain.Service fromService;
		try {
			Long serviceId = Long.parseLong(fromServiceId, 10);
			fromService = serviceRepository.findById(serviceId).get();
		} catch (NumberFormatException nfe) {
			fromService = null;
		}

		// get header if configured
		Header fromHeader;
		try {
			Long headerId = Long.parseLong(fromHeaderId, 10);
			fromHeader = headerRepository.findById(headerId).get();
		} catch (NumberFormatException nfe) {
			fromHeader = null;
		}

		if (fromEndpoint == null) {
			fromEndpoint = new FromEndpoint();
		}

		fromEndpoint.setUri(fromUri);
		fromEndpoint.setType(fromType);
		fromEndpoint.setOptions(fromOptions);

		if (fromService != null) {
			fromEndpoint.setService(fromService);
		}
		if (fromHeader != null) {
			fromEndpoint.setHeader(fromHeader);
		}

		return fromEndpoint;
	}

	private Set<ToEndpoint> getToEndpointsFromXML(String id, Document doc, Flow flow, boolean newFlow)
			throws Exception {

		if (newFlow) {
			toEndpoints = new HashSet<ToEndpoint>();
			XPath xPath = XPathFactory.newInstance().newXPath();
			int numberOfToEndpoints = Integer.parseInt(xPath.evaluate("count(//flows/flow[id='" + id + "']/to)", doc));
			numberOfToEndpoints = numberOfToEndpoints + 1;

			for (int i = 1; i < numberOfToEndpoints; i++) {
				String index = Integer.toString(i);
				toEndpoint = getToEndpointFromXML(id, doc, flow, null, index);
				toEndpoints.add(toEndpoint);
			}
		} else {

			toEndpoints = flow.getToEndpoints();

			for (ToEndpoint toEndpoint : toEndpoints) {

				Long toEndpointId = toEndpoint.getId();
				String index = "id='" + Long.toString(toEndpointId) + "'";
				toEndpoint = getToEndpointFromXML(id, doc, flow, toEndpoint, index);
				toEndpoints.add(toEndpoint);
			}

		}

		return toEndpoints;
	}

	private ToEndpoint getToEndpointFromXML(String id, Document doc, Flow flow, ToEndpoint toEndpoint, String index)
			throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

		String toUri = xPath.evaluate("//flows/flow[id='" + id + "']/to[" + index + "]/uri", doc);
		String toServiceId = xPath.evaluate("//flows/flow[id='" + id + "']/to[" + index + "]/service_id", doc);
		String toHeaderId = xPath.evaluate("//flows/flow[id='" + id + "']/to[" + index + "]/header_id", doc);
		String toOptions = null;

		// get type
		String[] toUriSplitted = toUri.split(":", 2);
		String toTypeAsString = toUriSplitted[0].toUpperCase();

		EndpointType toType = EndpointType.valueOf(toTypeAsString);

		// get uri
		toUri = toUriSplitted[1];
		while (toUri.startsWith("/")) {
			toUri = toUri.substring(1);
			;
		}

		// get options
		Map<String, String> toOptionsMap = getMap(doc, "//flows/flow[id='" + id + "']/to/options/*");

		for (Map.Entry<String, String> entry : toOptionsMap.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			if (toOptions != null) {
				toOptions = toOptions + "&" + key + "=" + value;
				;
			} else {
				toOptions = key + "=" + value;
			}

		}

		// get service if configured
		org.assimbly.gateway.domain.Service toService;
		try {
			Long serviceId = Long.parseLong(toServiceId, 10);
			toService = serviceRepository.findById(serviceId).get();
		} catch (NumberFormatException nfe) {
			toService = null;
		}

		// get header if configured
		Header toHeader;
		try {
			Long headerId = Long.parseLong(toHeaderId, 10);
			toHeader = headerRepository.findById(headerId).get();
		} catch (NumberFormatException nfe) {
			toHeader = null;
		}

		if (toEndpoint == null) {
			toEndpoint = new ToEndpoint();
		}

		toEndpoint.setUri(toUri);
		toEndpoint.setType(toType);
		toEndpoint.setFlow(flow);
		toEndpoint.setOptions(toOptions);

		if (toService != null) {
			toEndpoint.setService(toService);
		}
		if (toHeader != null) {
			toEndpoint.setHeader(toHeader);
		}

		return toEndpoint;

	}

	private ErrorEndpoint getErrorEndpointFromXML(String id, Document doc, ErrorEndpoint errorEndpoint)
			throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
		String errorUri = xPath.evaluate("//flows/flow[id='" + id + "']/error/uri", doc);
		String errorServiceId = xPath.evaluate("//flows/flow[id='" + id + "']/error/service_id", doc);
		String errorHeaderId = xPath.evaluate("//flows/flow[id='" + id + "']/error/header_id", doc);
		String errorOptions = null;

		// get type
		String[] errorUriSplitted = errorUri.split(":", 2);
		String errorTypeAsString = errorUriSplitted[0].toUpperCase();
		EndpointType errorType = EndpointType.valueOf(errorTypeAsString);

		// get uri
		errorUri = errorUriSplitted[1];
		while (errorUri.startsWith("/")) {
			errorUri = errorUri.substring(1);
		}

		// get options

		Map<String, String> errorOptionsMap = getMap(doc, "//flows/flow[id='" + id + "']/error/options/*");

		for (Map.Entry<String, String> entry : errorOptionsMap.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			if (errorOptions != null) {
				errorOptions = errorOptions + "&" + key + "=" + value;
				;
			} else {
				errorOptions = key + "=" + value;
			}
		}

		// get service if configured
		org.assimbly.gateway.domain.Service errorService;
		try {
			Long serviceId = Long.parseLong(errorServiceId, 10);
			errorService = serviceRepository.findById(serviceId).get();
		} catch (NumberFormatException nfe) {
			errorService = null;
		}

		// get header if configured
		Header errorHeader;
		try {
			Long headerId = Long.parseLong(errorHeaderId, 10);
			errorHeader = headerRepository.findById(headerId).get();
		} catch (NumberFormatException nfe) {
			errorHeader = null;
		}

		if (errorEndpoint == null) {
			errorEndpoint = new ErrorEndpoint();
		}

		errorEndpoint.setUri(errorUri);
		errorEndpoint.setType(errorType);
		errorEndpoint.setOptions(errorOptions);
		if (errorService != null) {
			errorEndpoint.setService(errorService);
		}
		if (errorHeader != null) {
			errorEndpoint.setHeader(errorHeader);
		}

		return errorEndpoint;

	}

	public String setServicesFromXML(Document doc, List<String> serviceIds) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

		for (String serviceId : serviceIds) {

			String serviceName = xPath.evaluate("/connectors/connector/services/service[id=" + serviceId + "]/name",
					doc);
			String serviceType = xPath.evaluate("/connectors/connector/services/service[id=" + serviceId + "]/type",
					doc);

			try {
				serviceIdLong = Long.parseLong(serviceId, 10);
				service = serviceRepository.findById(serviceIdLong).get();

				if (service == null) {
					service = new org.assimbly.gateway.domain.Service();
					serviceKeys = new HashSet<ServiceKeys>();
					service.setId(serviceIdLong);
					service.setName(serviceName);
					service.setType(serviceType);
				} else {
					if (serviceName != null) {
						service.setName(serviceName);
					} else {
						service.setName(serviceId);
					}
					service.setType(serviceType);
					serviceKeys = service.getServiceKeys();
				}
			} catch (NumberFormatException nfe) {
				service = new org.assimbly.gateway.domain.Service();
				serviceKeys = new HashSet<ServiceKeys>();
				if (serviceName != null) {
					service.setName(serviceName);
				} else {
					service.setName(serviceId);
				}
				service.setType(serviceType);

			}

			Map<String, String> serviceMap = getMap(doc,
					"/connectors/connector/services/service[id=" + serviceId + "]/keys/*");
			Map<String, ServiceKeys> map = new HashMap<>();
			for (ServiceKeys s : serviceKeys) {
				map.put(s.getKey(), s);
			}

			for (Map.Entry<String, String> entry : serviceMap.entrySet()) {

				String key = entry.getKey();
				String value = entry.getValue();
				ServiceKeys serviceKey;

				if (key.equals("type")) {
					service.setType(key);
				} else if (map.containsKey(key)) {
					serviceKey = map.get(key);
					serviceKey.setKey(key);
					serviceKey.setValue(value);
					serviceKeys.add(serviceKey);

				} else {
					serviceKey = new ServiceKeys();
					serviceKey.setKey(key);
					serviceKey.setValue(value);
					serviceKey.setType("constant");
					serviceKey.setService(service);
					serviceKeys.add(serviceKey);
				}
			}

			if (service != null && serviceKeys != null) {
				service.setServiceKeys(serviceKeys);
				serviceRepository.save(service);
				service = null;
				serviceKeys = null;
			}

		}

		return "ok";
	}

	public String setHeadersFromXML(Document doc, List<String> headerIds) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		for (String headerId : headerIds) {

			String headerName = xPath.evaluate("/connectors/connector/headers/header[id=" + headerId + "]/name", doc);

			try {
				headerIdLong = Long.parseLong(headerId, 10);
				header = headerRepository.findById(headerIdLong).get();

				if (header == null) {
					header = new Header();
					headerKeys = new HashSet<HeaderKeys>();
					header.setId(headerIdLong);
					if (headerName == null || headerName.isEmpty()) {
						header.setName(headerId);
					} else {
						header.setName(headerName);
					}
				} else {
					headerKeys = header.getHeaderKeys();
				}
			} catch (NumberFormatException nfe) {
				header = new Header();
				headerKeys = new HashSet<HeaderKeys>();
				if (headerName == null || headerName.isEmpty()) {
					header.setName(headerId);
				} else {
					header.setName(headerName);
				}
			}

			Map<String, HeaderKeys> map = new HashMap<>();
			for (HeaderKeys s : headerKeys) {
				map.put(s.getKey(), s);
			}

			// Create XPath object
			XPathExpression expr = xPath.compile("/connectors/connector/headers/header[id=" + headerId + "]/keys/*");

			NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
			for (int i = 0; i < nodes.getLength(); i++) {

				String key = nodes.item(i).getNodeName();
				String value = nodes.item(i).getTextContent();
				HeaderKeys headerKey;
				Node headerKeyType = nodes.item(i).getAttributes().getNamedItem("type");
				String type = "constant";

				if (headerKeyType != null) {
					type = headerKeyType.getTextContent();
				}

				if (map.containsKey(key)) {
					headerKey = map.get(key);
					headerKey.setKey(key);
					headerKey.setValue(value);
					headerKeys.add(headerKey);

				} else {
					headerKey = new HeaderKeys();
					headerKey.setKey(key);
					headerKey.setValue(value);
					headerKey.setType(type);
					headerKey.setHeader(header);
					headerKeys.add(headerKey);
				}
			}

			if (header != null && headerKeys != null) {
				header.setHeaderKeys(headerKeys);
				headerRepository.save(header);
				header = null;
				headerKeys = null;
			}

		}

		return "ok";

	}

	public void setEnvironmentVariablesFromXML(Document doc, Long connectorId, Gateway gateway) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

		Set<EnvironmentVariables> environmentVariablesList = gateway.getEnvironmentVariables();

		Map<String, EnvironmentVariables> map = new HashMap<>();
		for (EnvironmentVariables s : environmentVariablesList) {
			map.put(s.getKey(), s);
		}

		XPathExpression expr = xPath.compile("/connectors/connector/environmentVariables/*");
		NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

		for (int i = 0; i < nodes.getLength(); i++) {

			NodeList environmentVariableChildNode = nodes.item(i).getChildNodes();

			String key = environmentVariableChildNode.item(1).getTextContent();
			String value = environmentVariableChildNode.item(3).getTextContent();

			if (!map.containsKey(key)) {
				EnvironmentVariables environmentVariable = new EnvironmentVariables();
				environmentVariable.setKey(key);
				environmentVariable.setValue(value);
				environmentVariable.setGateway(gateway);
				environmentVariablesList.add(environmentVariable);
			} else {
				EnvironmentVariables environmentVariable = map.get(key);
				environmentVariable.setKey(key);
				environmentVariable.setValue(value);
				environmentVariable.setGateway(gateway);
				environmentVariablesList.add(environmentVariable);
			}
		}

		environmentVariablesRepository.saveAll(environmentVariablesList);

	}

	private static Map<String, String> getMap(Document doc, String input) throws Exception {

		// Create XPath object
		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xpath = xpathFactory.newXPath();
		XPathExpression expr = xpath.compile(input);

		// Create list of Ids
		Map<String, String> map = new HashMap<String, String>();
		NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
		for (int i = 0; i < nodes.getLength(); i++) {
			map.put(nodes.item(i).getNodeName(), nodes.item(i).getTextContent());
		}

		return map;
	}

	private static List<String> getList(Document doc, String input) throws Exception {

		// Create XPath object
		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xpath = xpathFactory.newXPath();
		XPathExpression expr = xpath.compile(input);

		// Create list of Ids
		List<String> list = new ArrayList<>();
		NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
		for (int i = 0; i < nodes.getLength(); i++) {
			list.add(nodes.item(i).getNodeValue());
		}

		return list;
	}

}
