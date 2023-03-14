package org.assimbly.gateway.config.exporting;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.FlowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class ExportProperties {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	private TreeMap<String, String> properties;

	public String stepType;
	public String componentType;
	public String uri;
	public String options;

	@Autowired
	private FlowRepository flowRepository;

	private Set<Step> steps;

	private Connection connection;

	private Message message;
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

		if (steps == null) {
			throw new Exception("Set of configuration failed. Step cannot be null");
		} else {
			getStepPropertiesFromDB(flow);
		}

		return properties;

	}

	public TreeMap<String, String> getFlowProperties(Flow flow) throws Exception {

		properties = new TreeMap<String, String>();

		getGeneralFlowPropertiesFromDB(flow);

		if (steps == null) {
			throw new Exception("Set of configuration failed. Step cannot be null");
		} else {
			getStepPropertiesFromDB(flow);
		}

		return properties;

	}

	public void getStepPropertiesFromDB(Flow flow) throws Exception {

		// set from properties
		getURIfromAssimblyDB("from");
		getConnectionFromAssimblyDB("from");
		getMessageFromAssimblyDB("from");

		// set to properties
		getURIfromAssimblyDB("to");
		getConnectionFromAssimblyDB("to");
		getMessageFromAssimblyDB("to");

        // set response properties
        getURIfromAssimblyDB("response");
        getConnectionFromAssimblyDB("response");
        getMessageFromAssimblyDB("response");

		// set error properties
		getURIfromAssimblyDB("error");
		getConnectionFromAssimblyDB("error");
		getMessageFromAssimblyDB("error");

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

		properties.put("message.contenttype", "text/xml;charset=UTF-8");

	}

	public void getURIfromAssimblyDB(String type) {

		options = "";

		for (Step step : steps) {

			stepType = step.getStepType().name();
			componentType = step.getComponentType();
			uri = step.getUri();
			options = step.getOptions();

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

	public void getConnectionFromAssimblyDB(String type) {

		for (Step step : steps) {
			connection = step.getConnection();
		}

		if (connection != null) {
			getConnectionProperties(type, connection);
		}

	}

	public void getConnectionProperties(String type, Connection connection) {
		properties.put(type + ".connection.id", connection.getId().toString());
	}

	public void getMessageFromAssimblyDB(String type) {

		for (Step step : steps) {

			message = step.getMessage();
		}

		if (message != null) {
			Set<Header> headers = message.getHeaders();

			for (Header header : headers) {
				properties.put(type + ".message." + header.getKey(), header.getValue());
			}
		}
	}

	private void getGeneralFlowPropertiesFromDB(Flow flow) throws Exception {

		steps = flow.getSteps();

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
