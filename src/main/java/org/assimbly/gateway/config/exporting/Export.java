package org.assimbly.gateway.config.exporting;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.apache.commons.text.StringSubstitutor;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Export {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	private String xmlConfiguration;
	private String configuration;

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	@Autowired
	private ExportXML exportXML;

	private String output;

	// exports gateway to XML, JSON or YAML format
	public String convertDBToConfiguration(Long integrationId, String mediaType, boolean isPlaceHolderReplacement) throws Exception {

		xmlConfiguration = exportXML.getXMLConfiguration(integrationId);

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
	public String convertDBToConfigurationByFlowIds(Long integrationId, String mediaType, String flowids, boolean isPlaceHolderReplacement) throws Exception {

		xmlConfiguration = exportXML.getXMLConfigurationByIds(integrationId, flowids);

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
