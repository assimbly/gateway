package org.assimbly.gateway.config.exporting;

import org.apache.commons.text.StringSubstitutor;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.docconverter.StringConverter;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class Export {

	public static final int PRETTY_PRINT_INDENT_FACTOR = 4;

	private String xmlConfiguration;
	private String configuration;

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	@Autowired
	private ExportXML exportXML;

	// exports gateway to XML, JSON or YAML format
	public String convertDBToConfiguration(Long integrationId, String mediaType, boolean isPlaceHolderReplacement) throws Exception {

		xmlConfiguration = exportXML.getXMLConfiguration(integrationId);
		if (isPlaceHolderReplacement) {
			xmlConfiguration = resolveFlowVariables(xmlConfiguration);
		}

		if (mediaType.contains("json")) {
			configuration = DocConverter.xmlToJson(xmlConfiguration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			configuration = DocConverter.xmlToYaml(xmlConfiguration);
		} else {
			configuration = xmlConfiguration;
		}

		// replace environment variables
		if(isPlaceHolderReplacement) {
			configuration = placeholdersReplacement(configuration);
		}

		return configuration;
	}

	// exports gateway by flowids to XML, JSON or YAML format
	public String convertDBToConfigurationByFlowIds(Long integrationId, String mediaType, String flowids, boolean isPlaceHolderReplacement) throws Exception {

		xmlConfiguration = exportXML.getXMLConfigurationByIds(integrationId, flowids);
		if (isPlaceHolderReplacement) {
			xmlConfiguration = resolveFlowVariables(xmlConfiguration);
		}

		if (mediaType.contains("json")) {
			configuration = DocConverter.xmlToJson(xmlConfiguration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			configuration = DocConverter.xmlToYaml(xmlConfiguration);
		} else {
			configuration = xmlConfiguration;
		}

		// replace environment variables
		if(isPlaceHolderReplacement) {
			configuration = placeholdersReplacement(configuration);
		}

		return configuration;
	}

	// exports flow to XML, JSON or YAML
	public String convertDBToFlowConfiguration(Long id, String mediaType, boolean isPlaceHolderReplacement) throws Exception {

		xmlConfiguration = exportXML.getXMLFlowConfiguration(id);
		if (isPlaceHolderReplacement) {
			xmlConfiguration = resolveFlowVariables(xmlConfiguration);
		}

		if (mediaType.contains("json")) {
			configuration = DocConverter.xmlToJson(xmlConfiguration);
		} else if (mediaType.contains("yaml") || mediaType.contains("text")) {
			configuration = DocConverter.xmlToYaml(xmlConfiguration);
		} else {
			configuration = xmlConfiguration;
		}

		// replace environment variables
		if(isPlaceHolderReplacement) {
			configuration = placeholdersReplacement(configuration);
		}

		return configuration;

	}

	/**
	 * Puts in each Flow's own Variables in that Flow only, before the global Variables are put in, so a Flow variable
	 * wins over a global one with the same key and may itself refer to a global one. The {@code <variables>} element
	 * is removed: the runtime gets the values, not the element.
	 */
	String resolveFlowVariables(String xml) throws Exception {
		Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
		NodeList flows = doc.getElementsByTagName("flow");
		boolean resolved = false;
		for (int i = 0; i < flows.getLength(); i++) {
			Element flow = (Element) flows.item(i);
			Element variables = child(flow, "variables");
			if (variables == null || !"flows".equals(flow.getParentNode().getNodeName())) {
				continue;
			}
			Map<String, String> values = new HashMap<>();
			NodeList entries = variables.getElementsByTagName("variable");
			for (int j = 0; j < entries.getLength(); j++) {
				Element entry = (Element) entries.item(j);
				Element key = child(entry, "key");
				Element value = child(entry, "value");
				if (key != null && !key.getTextContent().isBlank()) {
					values.put(key.getTextContent().trim(), value == null ? "" : value.getTextContent());
				}
			}
			flow.removeChild(variables);
			replaceInText(flow, new StringSubstitutor(values, "@{", "}"));
			resolved = true;
		}
		return resolved ? StringConverter.docToString(doc) : xml;
	}

	private static Element child(Element parent, String name) {
		for (Node node = parent.getFirstChild(); node != null; node = node.getNextSibling()) {
			if (node instanceof Element element && name.equals(element.getTagName())) {
				return element;
			}
		}
		return null;
	}

	private static void replaceInText(Node node, StringSubstitutor substitutor) {
		for (Node child = node.getFirstChild(); child != null; child = child.getNextSibling()) {
			if (child instanceof Text text) {
				text.setData(substitutor.replace(text.getData()));
			} else {
				replaceInText(child, substitutor);
			}
		}
	}

	private String placeholdersReplacement(String input) {

		List<EnvironmentVariables> environmentVariables = environmentVariablesRepository.findAll();

		Map<String, String> values = environmentVariables.stream().collect(Collectors.toMap(EnvironmentVariables::getKey, EnvironmentVariables::getValue));

        String output;
        if(values.containsValue("")) {
			output = "Error: Environment variables contain empty values";
		}else {
			StringSubstitutor sub = new StringSubstitutor(values, "@{", "}");
			output = sub.replace(input);
		}

		return output;

	}
}
