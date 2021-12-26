package org.assimbly.gateway.config.environment;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.*;

import org.apache.commons.lang3.StringUtils;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.domain.Gateway;
import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.ServiceKeys;
import org.assimbly.gateway.domain.Endpoint;
import org.assimbly.gateway.domain.enumeration.ComponentType;
import org.assimbly.gateway.domain.enumeration.EndpointType;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.LogLevelType;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.repository.HeaderRepository;
import org.assimbly.gateway.repository.ServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.springframework.util.CollectionUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

@Service
@Transactional
public class DBImportXMLConfiguration {

    private final Logger log = LoggerFactory.getLogger(DBImportXMLConfiguration.class);

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

	private Set<Endpoint> endpoints;

	private org.assimbly.gateway.domain.Service service;

	private Header header;
	public String xmlConfiguration;
	public String connectorId;

	public String configuration;

	private Endpoint endpoint;

	private Set<ServiceKeys> serviceKeys;

	private long serviceIdLong;

	private Set<HeaderKeys> headerKeys;

	private long headerIdLong;

	private Optional<Gateway> gatewayOptional;

	private Gateway gateway;

	private Optional<Flow> flowOptional;

	private Flow flow;

	public void setGatewayFromXML(Document doc, Long connectorId) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
		String gatewayId = xPath.evaluate("//connectors/connector/id", doc);
		String name = xPath.evaluate("//connectors/connector/name", doc);
		String type = xPath.evaluate("//connectors/connector/type", doc);
		String environmentName = xPath.evaluate("//connectors/connector/environmentName", doc);
		String stage = xPath.evaluate("//connectors/connector/stage", doc);
		String defaultFromComponentType = xPath.evaluate("//connectors/connector/defaultFromComponentType", doc);
		String defaultToComponentType = xPath.evaluate("//connectors/connector/defaultToComponentType", doc);
		String defaultErrorComponentType = xPath.evaluate("//connectors/connector/defaultErrorComponentType", doc);

        if (defaultFromComponentType.isEmpty()) {defaultFromComponentType = "FILE";};
        if (defaultToComponentType.isEmpty()) {defaultToComponentType = "FILE";};
        if (defaultErrorComponentType.isEmpty()) {defaultErrorComponentType = "FILE";};

		log.info("GatewayID=" + gatewayId);


		if (!gatewayId.isEmpty()) {

			log.info("Importing gateway: " + name);

			gatewayOptional = gatewayRepository.findById(connectorId);

			if (!gatewayOptional.isPresent()) {
				gateway = new Gateway();
			}else {
				gateway = gatewayOptional.get();
			}

            if (type == null || type.isEmpty()) {
                type = "CONNECTOR";
            }else {
                try {
                    GatewayType.valueOf(type);
                }catch (Exception e){
                    type = "CONNECTOR";
                }
            }


			gateway.setId(connectorId);
			gateway.setName(name);
			gateway.setEnvironmentName(environmentName);
			gateway.setType(GatewayType.valueOf(type));
			gateway.setStage(EnvironmentType.valueOf(stage));
			gateway.setDefaultFromComponentType(defaultFromComponentType);
			gateway.setDefaultToComponentType(defaultToComponentType);
			gateway.setDefaultErrorComponentType(defaultErrorComponentType);

			// create environment variables
			setEnvironmentVariablesFromXML(doc, connectorId, gateway);

			gatewayRepository.save(gateway);

			// create services and headers
			setServicesAndHeadersFromXML(doc);

			// create flows
			setFlowsFromXML(doc, connectorId);

			log.info("Importing gateway finished");

		}else {
			log.error("Can't import gateway. No valid gateway id found.");
			throw new Exception("Can't import gateway. No valid gateway id found.");
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
        String flowNotes = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/notes", doc);
		String flowAutostart = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/autostart", doc);
        String flowAssimblyHeaders = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/assimblyHeaders", doc);
		String flowOffloading = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/offloading", doc);
        String flowParallelProcessing = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/parallelProcessing", doc);

		String flowMaximumRedeliveries = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/maximumRedeliveries", doc);
		String flowRedeliveryDelay = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/redeliveryDelay", doc);
		String flowLogLevel = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/logLevel", doc);
        String flowVersion = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/version", doc);
        String flowLastModified = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/lastModified", doc);

		if (!flowId.isEmpty() && !flowName.isEmpty()) {

			log.info("Importing flow: " + flowName);

			flowOptional = flowRepository.findByName(flowName);
			gatewayOptional = gatewayRepository.findById(connectorId);

			if (!flowOptional.isPresent()) {
				flow = new Flow();
				flow.setId(id);

                endpoints = getEndpointsFromXML(flowId, doc, flow, true);
			} else {
				flow = flowOptional.get();
				endpoints = getEndpointsFromXML(flow.getId().toString(), doc, flow, false);
			}

			if (!gatewayOptional.isPresent()) {
				return "unknown gateway";
			} else {
				gateway = gatewayOptional.get();
				flow.setGateway(gateway);
			}

			if (flowName == null || flowName.isEmpty()) {
				flow.setName(flowId);
			} else {
				flow.setName(flowName);
			}

            if (flowNotes == null || flowNotes.isEmpty()) {
                flow.setNotes(null);
            } else {
                flow.setNotes(flowNotes);
            }

			if (flowAutostart != null && flowAutostart.equals("true")) {
				flow.setAutoStart(true);
			} else {
				flow.setAutoStart(false);
			}

            if (flowAssimblyHeaders != null && flowAssimblyHeaders.equals("true")) {
                flow.setAssimblyHeaders(true);
            } else {
                flow.setAssimblyHeaders(false);
            }

            if (flowOffloading != null && flowOffloading.equals("true")) {
				flow.setOffLoading(true);
			} else {
				flow.setOffLoading(false);
			}

            if (flowParallelProcessing != null && flowParallelProcessing.equals("true")) {
                flow.setParallelProcessing(true);
            } else {
                flow.setParallelProcessing(false);
            }

            if (flowMaximumRedeliveries != null) {
				flow.setMaximumRedeliveries(Integer.parseInt(flowMaximumRedeliveries));
			} else {
				flow.setMaximumRedeliveries(0);
			}

			if (flowRedeliveryDelay != null) {
				flow.setRedeliveryDelay(Integer.parseInt(flowRedeliveryDelay));
			} else {
				flow.setRedeliveryDelay(3000);
			}

			if (flowLogLevel != null) {
				flowLogLevel = flowLogLevel.toUpperCase();
				if(flowLogLevel.equals("ERROR")||flowLogLevel.equals("WARN")||flowLogLevel.equals("INFO")||flowLogLevel.equals("DEBUG")||flowLogLevel.equals("TRACE")) {
					flow.setLogLevel(LogLevelType.valueOf(flowLogLevel));
				}else {
					flow.setLogLevel(LogLevelType.OFF);
				}
			} else {
				flow.setLogLevel(LogLevelType.OFF);
			}


            if (flowVersion != null) {
                try {
                    flow.setVersion(Integer.parseInt(flowVersion));
                }
                catch (NumberFormatException e)
                {
                    flow.setVersion(1);
                }
            } else {
                flow.setVersion(1);
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

			flow.setEndpoints(endpoints);

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

	private Set<Endpoint> getEndpointsFromXML(String id, Document doc, Flow flow, boolean newFlow)
			throws Exception {

		if (newFlow) {
            endpoints = new HashSet<Endpoint>();
			XPath xPath = XPathFactory.newInstance().newXPath();
			int numberOfEndpoints = Integer.parseInt(xPath.evaluate("count(//flows/flow[id='" + id + "']/endpoints/endpoint)", doc));
			numberOfEndpoints = numberOfEndpoints + 1;

			for (int i = 1; i < numberOfEndpoints; i++) {
				String index = Integer.toString(i);
				endpoint = getEndpointFromXML(id, doc, flow, null, index);
				endpoints.add(endpoint);
			}
		} else {

			endpoints = flow.getEndpoints();

			Integer index = 1;

			for (Endpoint endpoint : endpoints) {

                XPath xPath = XPathFactory.newInstance().newXPath();
                id = xPath.evaluate("//flows/flow[name='" + flow.getName() + "']/id", doc);

                Long endpointId = endpoint.getId();
				endpoint = getEndpointFromXML(id, doc, flow, endpoint, index.toString());
				endpoints.add(endpoint);
				index++;
			}

		}

        return endpoints;
	}

	private Endpoint getEndpointFromXML(String id, Document doc, Flow flow, Endpoint endpoint, String index) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

		String endpointXPath = "/connectors/connector/flows/flow[id='" + id + "']/endpoints/endpoint[" + index + "]/";

		String type = xPath.evaluate(endpointXPath + "type", doc);
		String uri = xPath.evaluate(endpointXPath + "uri", doc);
		String options = "";
		String serviceId = xPath.evaluate(endpointXPath + "service_id", doc);
		String headerId = xPath.evaluate(endpointXPath + "header_id", doc);
        String responseIdAsString = xPath.evaluate(endpointXPath + "response_id", doc);
        String routeId = xPath.evaluate(endpointXPath + "route_id", doc);

        // get type
		String[] uriSplitted = uri.split(":", 2);

        String componentTypeAsString = uriSplitted[0].toUpperCase();

        componentTypeAsString = componentTypeAsString.replace("-", "");

        ComponentType componentType = ComponentType.valueOf(componentTypeAsString);
        EndpointType endpointType = EndpointType.valueOf(type.toUpperCase());

        // get uri
		uri = uriSplitted[1];
		while (uri.startsWith("/")) {
			uri = uri.substring(1);
		}

		// get options
		Map<String, String> optionsMap = getMap(doc, endpointXPath + "options/*");

		for (Map.Entry<String, String> entry : optionsMap.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			if (options != null && !options.isEmpty()) {
				options = options + "&" + key + "=" + value;
				;
			} else {
				options = key + "=" + value;
			}

		}

		// get service if configured
		org.assimbly.gateway.domain.Service service;
		try {

            Long serviceIdLong = Long.parseLong(serviceId, 10);

            String serviceName = xPath.evaluate("/connectors/connector/services/service[id=" + serviceIdLong + "]/name",doc);

            Optional<org.assimbly.gateway.domain.Service>serviceOptional = serviceRepository.findByName(serviceName);

			if(serviceOptional.isPresent()) {
                service = serviceOptional.get();
            }else {
                service = null;
			}
		} catch (NumberFormatException nfe) {
			service = null;
		}

		// get header if configured
		Header header;
		try {

			Long headerIdLong = Long.parseLong(headerId, 10);
			String headerName = xPath.evaluate("/connectors/connector/headers/header[id=" + headerIdLong + "]/name",doc);
			Optional<Header> headerOptional = headerOptional = headerRepository.findByName(headerName);
			if(headerOptional.isPresent()) {
				header = headerOptional.get();
			}else {
				header = null;
			}

		} catch (NumberFormatException nfe) {
			header = null;
		}

		//get responseId if configured
        Integer responseId = null;
        if(StringUtils.isNumeric(responseIdAsString)){
            responseId = Integer.parseInt(responseIdAsString);
        }

		if (endpoint == null) {
			endpoint = new Endpoint();
		}

        endpoint.setEndpointType(endpointType);
		endpoint.setComponentType(componentType);
        endpoint.responseId(responseId);
        endpoint.setUri(uri);
		endpoint.setFlow(flow);
		endpoint.setOptions(options);

		if (service != null) {
			endpoint.setService(service);
		}
		if (header != null) {
			endpoint.setHeader(header);
		}
		if(responseId != null){
		    endpoint.setResponseId(responseId);
        }

        return endpoint;

	}

	public String setServicesFromXML(Document doc, List<String> serviceIds) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

        Map<String, String> servicesIdMap = new HashMap<String, String>();

		for (String serviceId : serviceIds) {

			String serviceName = xPath.evaluate("/connectors/connector/services/service[id=" + serviceId + "]/name",doc);
			String serviceType = xPath.evaluate("/connectors/connector/services/service[id=" + serviceId + "]/type",doc);

			log.info("Importing service: " + serviceName);

			try {
				serviceIdLong = Long.parseLong(serviceId, 10);
				Optional<org.assimbly.gateway.domain.Service> serviceOptional = serviceRepository.findByName(serviceName);

				if(!serviceOptional.isPresent()) {
					service = new org.assimbly.gateway.domain.Service();
					serviceKeys = new HashSet<ServiceKeys>();
					service.setId(null);
					service.setName(serviceName);
					service.setType(serviceType);
				} else {
					service = serviceOptional.get();
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

			Map<String, String> serviceMap = getMap(doc,"/connectors/connector/services/service[id=" + serviceId + "]/keys/*");
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

				service = serviceRepository.save(service);

                //save servicekeys
                service.setServiceKeys(serviceKeys);
                service = serviceRepository.save(service);

				String generatedServiceId = service.getId().toString();

                servicesIdMap.put(serviceId, generatedServiceId);

                service = null;
				serviceKeys = null;
			}

		}


        for (Map.Entry<String, String> entry : servicesIdMap.entrySet()) {

            String serviceId = entry.getKey();
            String generatedServiceId= entry.getValue();

            System.out.println("map");
            System.out.println("key=" + serviceId);
            System.out.println("value=" + generatedServiceId);

            //update service_id to generated service_id
            if(!serviceId.equals(generatedServiceId)) {

                NodeList servicesIdNodes = (NodeList) xPath.compile("/connectors/connector/flows/flow/*/*[service_id=" + serviceId + "]/service_id").evaluate(doc, XPathConstants.NODESET);

                for (int i = 0; i < servicesIdNodes.getLength(); i++) {
                    servicesIdNodes.item(i).setTextContent("id" + generatedServiceId);
                }

                NodeList servicesNodes = (NodeList) xPath.compile("/connectors/connector/services/service[id=" + serviceId + "]/id").evaluate(doc, XPathConstants.NODESET);

                servicesNodes.item(0).setTextContent("id" + generatedServiceId);

            }

        }

        NodeList servicesIdNodes = (NodeList) xPath.compile("/connectors/connector/flows/flow/*/*/service_id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < servicesIdNodes.getLength(); i++) {
            String updateId =  servicesIdNodes.item(i).getTextContent();
            servicesIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList servicesNodes = (NodeList) xPath.compile("/connectors/connector/services/*/id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < servicesNodes.getLength(); i++) {
            String updateId =  servicesNodes.item(i).getTextContent();
            servicesNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        return "ok";
	}

	public String setHeadersFromXML(Document doc, List<String> headerIds) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

        Map<String, String> headersIdMap = new HashMap<String, String>();

		for (String headerId : headerIds) {

			String headerName = xPath.evaluate("/connectors/connector/headers/header[id=" + headerId + "]/name", doc);

			try {
				headerIdLong = Long.parseLong(headerId, 10);
				Optional<Header> headerOptional = headerRepository.findByName(headerName);

				if (!headerOptional.isPresent()) {
					header = new Header();
					headerKeys = new HashSet<HeaderKeys>();
					header.setId(null);
					if (headerName == null || headerName.isEmpty()) {
						header.setName(headerId);
					} else {
						header.setName(headerName);
					}
				} else {
					header = headerOptional.get();
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

				header = headerRepository.save(header);

                header.setHeaderKeys(headerKeys);
                header = headerRepository.save(header);

                String generatedHeaderId = header.getId().toString();

                headersIdMap.put(headerId, generatedHeaderId);



				header = null;
				headerKeys = null;
			}

		}

        for (Map.Entry<String, String> entry : headersIdMap.entrySet()) {

            String headerId = entry.getKey();
            String generatedHeaderId= entry.getValue();

            //update header_id to generated header_id
            if(!headerId.equals(generatedHeaderId)) {

                NodeList headerNodes = (NodeList) xPath.compile("/connectors/connector/headers/header[id=" + headerId + "]/id/text()").evaluate(doc, XPathConstants.NODESET);
                headerNodes.item(0).setTextContent("id" + generatedHeaderId);

                NodeList servicesIdNodes = (NodeList) xPath.compile("/connectors/connector/flows/flow/*/*[header_id=" + headerId + "]/header_id").evaluate(doc, XPathConstants.NODESET);

                for (int i = 0; i < servicesIdNodes.getLength(); i++) {
                    servicesIdNodes.item(i).setTextContent("id" + generatedHeaderId);
                }

            }

        }


        NodeList headersIdNodes = (NodeList) xPath.compile("/connectors/connector/flows/flow/*/*/header_id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < headersIdNodes.getLength(); i++) {
            String updateId =  headersIdNodes.item(i).getTextContent();
            headersIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList headersNodes = (NodeList) xPath.compile("/connectors/connector/headers/*/id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < headersNodes.getLength(); i++) {
            String updateId =  headersNodes.item(i).getTextContent();
            headersNodes.item(i).setTextContent(updateId.replace("id",""));
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
            String encrypted = environmentVariableChildNode.item(5).getTextContent();

            boolean encryptedBoolean = false;
            if(encrypted.equalsIgnoreCase("true")){
                encryptedBoolean = true;
            }

			if (!map.containsKey(key)) {
				EnvironmentVariables environmentVariable = new EnvironmentVariables();
				environmentVariable.setKey(key);
				environmentVariable.setValue(value);
                environmentVariable.setEncrypted(encryptedBoolean);
				environmentVariable.setGateway(gateway);
				environmentVariablesList.add(environmentVariable);
			} else {
				EnvironmentVariables environmentVariable = map.get(key);
				environmentVariable.setKey(key);
				environmentVariable.setValue(value);
                environmentVariable.setEncrypted(encryptedBoolean);
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
