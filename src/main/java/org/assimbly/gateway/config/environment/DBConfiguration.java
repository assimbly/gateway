package org.assimbly.gateway.config.environment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.lang3.text.StrSubstitutor;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.w3c.dom.Document;

@SuppressWarnings("deprecation")
@Service
public class DBConfiguration {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	private List<TreeMap<String, String>> propertiesList;
	private TreeMap<String, String> properties;
	private String xmlConfiguration;
	private String configuration;

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	@Autowired
	private DBExportProperties dbExportProperties;

	@Autowired
	private DBExportXMLConfiguration dbExportXML;

	@Autowired
	private DBImportXMLConfiguration dbImportXML;

	// exports connector to object (List of treemaps)
	public List<TreeMap<String, String>> convertDBToConfiguration(Long gatewayId) throws Exception {

		propertiesList = new ArrayList<>();
		propertiesList = dbExportProperties.getProperties(gatewayId);

		return propertiesList;
	}

	// exports flow to properties (treemap)
	public TreeMap<String, String> convertDBToFlowConfiguration(Long id) throws Exception {

		properties = new TreeMap<String, String>();

		properties = dbExportProperties.getFlowProperties(id);

		return properties;

	}

	// exports connector to XML, JSON or YAML format
	public String convertDBToConfiguration(Long gatewayId, String mediaType) throws Exception {

		xmlConfiguration = dbExportXML.getXMLConfiguration(gatewayId);

		if (mediaType.contains("json")) {
			configuration = DocConverter.convertXmlToJson(xmlConfiguration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			configuration = DocConverter.convertXmlToYaml(xmlConfiguration);
		} else {
			configuration = xmlConfiguration;
		}

		// replace environment variables
		configuration = PlaceholdersReplacement(configuration);

		return configuration;
	}

	// exports flow to XML, JSON or YAML
	public String convertDBToFlowConfiguration(Long id, String mediaType) throws Exception {

		xmlConfiguration = dbExportXML.getXMLFlowConfiguration(id);

		if (mediaType.contains("json")) {
			configuration = DocConverter.convertXmlToJson(xmlConfiguration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			configuration = DocConverter.convertXmlToYaml(xmlConfiguration);
		} else {
			configuration = xmlConfiguration;
		}

		// replace environment variables
		configuration = PlaceholdersReplacement(configuration);

		return configuration;

	}

	// imports connector configuration (complete configuration file)
	public String convertConfigurationToDB(Long gatewayId, String mediaType, String configuration) throws Exception {

		// get the configuration as XML Document
		Document doc = getDocument(mediaType, configuration);

		// create gateway
		dbImportXML.setGatewayFromXML(doc, gatewayId);

		return "ok";

	}

	// imports flow configuration
	public String convertFlowConfigurationToDB(Long gatewayId, Long id, String mediaType, String flowConfiguration)
			throws Exception {

		// get the configuration as XML Document
		Document doc = getDocument(mediaType, configuration);

		// create services and headers
		dbImportXML.setServicesAndHeadersFromXML(doc);

		// create flow
		dbImportXML.setFlowFromXML(doc, gatewayId, id);

		return "ok";

	}

	// private methods
	private Document getDocument(String mediaType, String configuration) throws Exception {

		if (mediaType.contains("json")) {
			xmlConfiguration = DocConverter.convertJsonToXml(configuration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			xmlConfiguration = DocConverter.convertYamlToXml(configuration);
		} else {
			xmlConfiguration = configuration;
		}

		Document document = DocConverter.convertStringToDoc(xmlConfiguration);

		return document;
	}

	private String PlaceholdersReplacement(String input) {

		List<EnvironmentVariables> environmentVariables = environmentVariablesRepository.findAll();

		Map<String, String> values = new HashMap<String, String>();

		for (EnvironmentVariables environmentVariable : environmentVariables) {
			values.put(environmentVariable.getKey(), environmentVariable.getValue());
		}

		StrSubstitutor sub = new StrSubstitutor(values, "@{", "}");

		String output = sub.replace(input);

		return output;

	}

}
