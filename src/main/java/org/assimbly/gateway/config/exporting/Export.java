package org.assimbly.gateway.config.exporting;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.assimbly.util.TransformUtil;
import org.apache.commons.text.StringSubstitutor;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.w3c.dom.Document;

@Service
public class Export {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	private List<TreeMap<String, String>> propertiesList;
	private TreeMap<String, String> properties;
	private String xmlConfiguration;
	private String configuration;

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	@Autowired
	private ExportProperties exportProperties;

	@Autowired
	private ExportXML exportXML;

	private String output;

	// exports gateway to object (List of treemaps)
	public List<TreeMap<String, String>> convertDBToConfiguration(Long gatewayId) throws Exception {

		propertiesList = new ArrayList<>();
		propertiesList = exportProperties.getProperties(gatewayId);

		return propertiesList;
	}

	// exports flow to properties (treemap)
	public TreeMap<String, String> convertDBToFlowConfiguration(Long id) throws Exception {

		properties = new TreeMap<String, String>();

		properties = exportProperties.getFlowProperties(id);

		return properties;

	}

	// exports gateway to XML, JSON or YAML format
	public String convertDBToConfiguration(Long gatewayId, String mediaType, boolean isPlaceHolderReplacement) throws Exception {

		xmlConfiguration = exportXML.getXMLConfiguration(gatewayId);

		if (mediaType.contains("json")) {
			configuration = DocConverter.convertXmlToJson(xmlConfiguration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			configuration = DocConverter.convertXmlToYaml(xmlConfiguration);
		} else {
			configuration = xmlConfiguration;
		}

		// replace environment variables
		if(isPlaceHolderReplacement) {
			configuration = PlaceholdersReplacement(configuration);
		}
		
		return configuration;
	}

	// exports gateway by flowids to XML, JSON or YAML format
	public String convertDBToConfigurationByFlowIds(Long gatewayId, String mediaType, String flowids, boolean isPlaceHolderReplacement) throws Exception {

		xmlConfiguration = exportXML.getXMLConfigurationByIds(gatewayId, flowids);

		if (mediaType.contains("json")) {
			configuration = DocConverter.convertXmlToJson(xmlConfiguration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			configuration = DocConverter.convertXmlToYaml(xmlConfiguration);
		} else {
			configuration = xmlConfiguration;
		}

		// replace environment variables
		if(isPlaceHolderReplacement) {
			configuration = PlaceholdersReplacement(configuration);
		}

		return configuration;
	}
	
	// exports flow to XML, JSON or YAML
	public String convertDBToFlowConfiguration(Long id, String mediaType, boolean isPlaceHolderReplacement) throws Exception {

		xmlConfiguration = exportXML.getXMLFlowConfiguration(id);

		if (mediaType.contains("json")) {
			configuration = DocConverter.convertXmlToJson(xmlConfiguration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			configuration = DocConverter.convertXmlToYaml(xmlConfiguration);
		} else {
			configuration = xmlConfiguration;
		}

		// replace environment variables
		if(isPlaceHolderReplacement) {
			configuration = PlaceholdersReplacement(configuration);
		}
		
		return configuration;

	}

	private String PlaceholdersReplacement(String input) {

		List<EnvironmentVariables> environmentVariables = environmentVariablesRepository.findAll();
		
		Map<String, String> values = environmentVariables.stream().collect(Collectors.toMap(EnvironmentVariables::getKey, EnvironmentVariables::getValue));
		
		if(values.containsValue("")) {
			output = "Error: Environment variables contain empty values";
		}else {
			StringSubstitutor sub = new StringSubstitutor(values, "@{", "}");
			output = sub.replace(input);
		}	

		return output;

	}
}
