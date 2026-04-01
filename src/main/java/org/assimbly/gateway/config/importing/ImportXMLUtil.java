package org.assimbly.gateway.config.importing;

import org.apache.commons.lang3.StringUtils;
import org.assimbly.docconverter.DocConverter;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ImportXMLUtil {

    public static Document getDocument(String mediaType, String configuration) throws Exception {

        String xmlConfiguration;
        if (mediaType.contains("json")) {
            xmlConfiguration = DocConverter.convertJsonToXml(configuration);
        } else if (mediaType.contains("yaml") || mediaType.contains("text")) {
            xmlConfiguration = DocConverter.convertYamlToXml(configuration);
        } else {
            xmlConfiguration = configuration;
        }

        return DocConverter.convertStringToDoc(xmlConfiguration);

    }

    public static Map<String, String> getMap(Document doc, String input) throws Exception {

		// Create XPath object
		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xpath = xpathFactory.newXPath();
		XPathExpression expr = xpath.compile(input);

		// Create list of Ids
		Map<String, String> map = new ConcurrentHashMap<>();
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
