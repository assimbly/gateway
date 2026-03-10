package org.assimbly.gateway.config.importing;

import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class ImportXMLEnvironmentVariables {

	@Autowired
	private EnvironmentVariablesRepository environmentVariablesRepository;

	public void setEnvironmentVariablesFromXML(Document doc, Integration integration) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();

		Set<EnvironmentVariables> environmentVariablesList = integration.getEnvironmentVariables();

		Map<String, EnvironmentVariables> map = new ConcurrentHashMap<>();
		for (EnvironmentVariables s : environmentVariablesList) {
			map.put(s.getKey(), s);
		}

		XPathExpression expr = xPath.compile("/dil/core/environmentVariables/*");
		NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

		for (int i = 0; i < nodes.getLength(); i++) {

			NodeList environmentVariableChildNode = nodes.item(i).getChildNodes();

			String key = environmentVariableChildNode.item(1).getTextContent();
			String value = environmentVariableChildNode.item(3).getTextContent();
            String encrypted = environmentVariableChildNode.item(5).getTextContent();

            boolean encryptedBoolean = encrypted.equalsIgnoreCase("true");

            EnvironmentVariables environmentVariable;
            if (!map.containsKey(key)) {
                environmentVariable = new EnvironmentVariables();
            } else {
                environmentVariable = map.get(key);
            }
            environmentVariable.setKey(key);
            environmentVariable.setValue(value);
            environmentVariable.setEncrypted(encryptedBoolean);
            environmentVariable.setIntegration(integration);
            environmentVariablesList.add(environmentVariable);
        }

		environmentVariablesRepository.saveAll(environmentVariablesList);

	}

}
