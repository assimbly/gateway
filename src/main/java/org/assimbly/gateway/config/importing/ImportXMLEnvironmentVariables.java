package org.assimbly.gateway.config.importing;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.util.*;

@Service
@Transactional
public class ImportXMLEnvironmentVariables {

    private final Logger log = LoggerFactory.getLogger(ImportXMLEnvironmentVariables.class);

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	public String xmlConfiguration;
	public String configuration;


	public void setEnvironmentVariablesFromXML(Document doc, Long integrationId, Gateway gateway) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

		Set<EnvironmentVariables> environmentVariablesList = gateway.getEnvironmentVariables();

		Map<String, EnvironmentVariables> map = new HashMap<>();
		for (EnvironmentVariables s : environmentVariablesList) {
			map.put(s.getKey(), s);
		}

		XPathExpression expr = xPath.compile("/integrations/integration/environmentVariables/*");
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

}
