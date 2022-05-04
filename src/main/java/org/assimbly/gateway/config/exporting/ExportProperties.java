package org.assimbly.gateway.config.exporting;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.Endpoint;
import org.assimbly.gateway.repository.FlowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class ExportProperties {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	private TreeMap<String, String> properties;

	public String endpointType;
	public String componentType;
	public String uri;
	public String options;

	@Autowired
	private FlowRepository flowRepository;

	private Set<Endpoint> endpoints;

	private org.assimbly.gateway.domain.Service service;

	private Header header;
	public String xmlConfiguration;
	private Flow flow;
	public String integrationId;

	public String configuration;

	private List<TreeMap<String, String>> propertiesList;

	// Treemap get methods
	public List<TreeMap<String, String>> getProperties(Long gatewayId) throws Exception {

		propertiesList = new ArrayList<>();
		List<Flow> flows= flowRepository.findAllByGatewayId(gatewayId);

		for (Flow flow : flows) {

			if (flow != null) {
				TreeMap<String, String> flowConfiguration = getFlowProperties(flow.getId());
				if (flowConfiguration != null) {
					propertiesList.add(flowConfiguration);
				}
			}
		}

		return propertiesList;

	}

	public TreeMap<String, String> getFlowProperties(Long id) throws Exception {

		properties = new TreeMap<String, String>();

		flow = flowRepository.findById(id).get();

		if (flow == null) {
			throw new Exception("Flow ID does not exists");
		}

		getGeneralFlowPropertiesFromDB(flow);

		if (endpoints == null) {
			throw new Exception("Set of configuration failed. Endpoint cannot be null");
		} else {
			getEndpointPropertiesFromDB(flow);
		}

		return properties;

	}

	public TreeMap<String, String> getFlowProperties(Flow flow) throws Exception {

		properties = new TreeMap<String, String>();

		getGeneralFlowPropertiesFromDB(flow);

		if (endpoints == null) {
			throw new Exception("Set of configuration failed. Endpoint cannot be null");
		} else {
			getEndpointPropertiesFromDB(flow);
		}

		return properties;

	}

	public void getEndpointPropertiesFromDB(Flow flow) throws Exception {

		// set from properties
		getURIfromAssimblyDB("from");
		getServiceFromAssimblyDB("from");
		getHeaderFromAssimblyDB("from");

		// set to properties
		getURIfromAssimblyDB("to");
		getServiceFromAssimblyDB("to");
		getHeaderFromAssimblyDB("to");

        // set response properties
        getURIfromAssimblyDB("response");
        getServiceFromAssimblyDB("response");
        getHeaderFromAssimblyDB("response");

		// set error properties
		getURIfromAssimblyDB("error");
		getServiceFromAssimblyDB("error");
		getHeaderFromAssimblyDB("error");

		// set up defaults settings if null -->
		properties.put("id", Long.toString(flow.getId()));

		if (properties.get("from.uri") != null) {
			properties.put("route", "default");
		} else {
			properties.put("route", "none");
		}

		if (properties.get("to.uri") == null) {
			properties.put("to.uri", "stream:out");
		} else if (properties.get("to.uri").contains("wastebin")) {

			String uri = properties.get("to.uri");
			uri = uri.replace("wastebin:", "mock:wastebin");
			properties.put("to.uri", uri);
		}

		properties.put("header.contenttype", "text/xml;charset=UTF-8");

	}

	public void getURIfromAssimblyDB(String type) {

		options = "";

		for (Endpoint endpoint : endpoints) {

			endpointType = endpoint.getEndpointType().name();
			componentType = endpoint.getComponentType();
			uri = endpoint.getUri();
			options = endpoint.getOptions();

			getURIProperties(type, componentType, uri, options);
		}

	}

	public void getURIProperties(String type, String componentType, String uri, String confOptions) {

		componentType = componentType.toLowerCase();

		componentType = setDefaultComponentType(componentType);

		if (confOptions == null) {
			uri = componentType.toLowerCase() + uri;
		} else {
			uri = componentType.toLowerCase() + uri + "?" + confOptions;
		}

		properties.put(type + ".uri", uri);
	}

	public void getServiceFromAssimblyDB(String type) {

		for (Endpoint endpoint : endpoints) {
			service = endpoint.getService();
		}

		if (service != null) {
			getServiceProperties(type, service);
		}

	}

	public void getServiceProperties(String type, org.assimbly.gateway.domain.Service service) {
		properties.put(type + ".service.id", service.getId().toString());
	}

	public void getHeaderFromAssimblyDB(String type) {

		for (Endpoint endpoint : endpoints) {

			header = endpoint.getHeader();
		}

		if (header != null) {
			Set<HeaderKeys> headerKeys = header.getHeaderKeys();

			for (HeaderKeys headerKey : headerKeys) {
				properties.put(type + ".header." + headerKey.getKey(), headerKey.getValue());
			}
		}
	}

	private void getGeneralFlowPropertiesFromDB(Flow flow) throws Exception {

		endpoints = flow.getEndpoints();

	}

	private String setDefaultComponentType(String componentType) {

		if (componentType.equals("file") || componentType.equals("ftp") || componentType.equals("sftp") || componentType.equals("ftps")) {
			componentType = componentType + "://";
		} else {
			componentType = componentType + ":";
		}

		return componentType;
	}

}
