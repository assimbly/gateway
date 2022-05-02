package org.assimbly.gateway.config.importing;

import org.apache.commons.lang3.StringUtils;
import org.assimbly.docconverter.DocConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.util.*;

public class ImportXMLUtil {

    private static String xmlConfiguration;
    private final Logger log = LoggerFactory.getLogger(ImportXMLUtil.class);

	public String options;
	public String componentType;
	public String uri;
	public String configuration;

    public static Document getDocument(String mediaType, String configuration) throws Exception {

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

    public static Map<String, String> getMap(Document doc, String input) throws Exception {

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

    public static List<String> getList(Document doc, String input) throws Exception {

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

    public static String setStringValue(String value, String defaultValue){
        if (value != null && !value.isEmpty()) {
            return value;
        }else{
            return defaultValue;
        }
    }

    public static boolean setBooleanValue(String value){
        return value != null && value.equals("true");
    }

    public static int setIntegerValue(String value, int defaultValue){
        if (StringUtils.isNumeric(value)) {
            return Integer.parseInt(value);
        } else {
            return defaultValue;
        }
    }

}
