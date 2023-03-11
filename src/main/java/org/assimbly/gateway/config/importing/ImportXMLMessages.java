package org.assimbly.gateway.config.importing;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.util.*;

@Service
@Transactional
public class ImportXMLMessages {

    private final Logger log = LoggerFactory.getLogger(ImportXMLMessages.class);

	public String options;
	public String componentType;
	public String uri;

	@Autowired
	private HeaderRepository headerRepository;

	public String xmlConfiguration;
	public String configuration;

    private Header header;
    private Map<String, String> messagesIdMap;

    private Set<HeaderKeys> headerKeys;

	public String setMessagesFromXML(Document doc) throws Exception {

        log.info("Importing messages");

        // create messages
		List<String> messageIds = ImportXMLUtil.getList(doc, "/dil/core/messages/message/id/text()");

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

        messagesIdMap = new HashMap<String, String>();

        for (String messageId : messageIds) {
			setMessageFromXML(doc, messageId);
		}

        for (Map.Entry<String, String> entry : messagesIdMap.entrySet()) {
			updateMessageIdsFromXml(doc, entry);
        }

        NodeList headersIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/*/*/options/header_id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < headersIdNodes.getLength(); i++) {
            String updateId =  headersIdNodes.item(i).getTextContent();
            headersIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList messageNodes = (NodeList) xPath.compile("/dil/core/messages/*/id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < messageNodes.getLength(); i++) {
            String updateId =  messageNodes.item(i).getTextContent();
            messageNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        log.info("Importing headers finished");

        return "ok";

	}

	public void setMessageFromXML(Document doc, String messageId) throws Exception {

        XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String messageName = xPath.evaluate("/dil/core/messages/message[id=" + messageId + "]/name", doc);

        log.info("Start importing message: " + messageName);

		try {
			Long.parseLong(messageId, 10);
			Optional<Header> headerOptional = headerRepository.findByName(messageName);

			if (!headerOptional.isPresent()) {
                log.debug("Create new message: " + messageName);
                header = new Header();
				headerKeys = new HashSet<HeaderKeys>();
				header.setId(null);
				if (messageName == null || messageName.isEmpty()) {
					header.setName(messageId);
				} else {
					header.setName(messageName);
				}
			} else {
                log.debug("Update message: " + messageName);
				header = headerOptional.get();
				headerKeys = header.getHeaderKeys();
			}
		} catch (NumberFormatException nfe) {
			header = new Header();
			headerKeys = new HashSet<HeaderKeys>();
			if (messageName == null || messageName.isEmpty()) {
				header.setName(messageId);
			} else {
				header.setName(messageName);
			}
		}

        log.debug("Get Header Keys: " + messageName);

        Map<String, HeaderKeys> map = new HashMap<>();
		for (HeaderKeys s : headerKeys) {
			map.put(s.getKey(), s);
		}

        log.debug("Set Header Keys: " + messageName);

        // Create XPath object
		XPathExpression expr = xPath.compile("/dil/core/messages/message[id='" + messageId + "']/headers/*");

		NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < nodes.getLength(); i++) {

			String key = nodes.item(i).getNodeName();
			String value = nodes.item(i).getTextContent();
			HeaderKeys headerKey;
			Node headerKeyType = nodes.item(i).getAttributes().getNamedItem("type");
			String type = "header";
            Node headerKeyLanguage = nodes.item(i).getAttributes().getNamedItem("language");
            String language = "constant";

			if (headerKeyType != null) {
				type = headerKeyType.getTextContent();
			}

            if (headerKeyLanguage != null) {
                language = headerKeyLanguage.getTextContent();
            }

			if (map.containsKey(key)) {
				headerKey = map.get(key);
				headerKey.setKey(key);
				headerKey.setValue(value);
				headerKeys.add(headerKey);

			} else {
                headerKey = new HeaderKeys();
				headerKey.setKey(key);
				headerKey.setValue(value);
				headerKey.setType(type);
                headerKey.setLanguage(language);
                headerKey.setHeader(header);
				headerKeys.add(headerKey);
			}
		}

		if (header != null && headerKeys != null) {

            log.debug("Import into database: " + messageName);

            header = headerRepository.save(header);

			header.setHeaderKeys(headerKeys);

			header = headerRepository.save(header);

			String generatedmessageId = header.getId().toString();

			messagesIdMap.put(messageId, generatedmessageId);

			header = null;
			headerKeys = null;
		}

        log.info("Finished importing header: " + messageName);

    }

	public void updateMessageIdsFromXml(Document doc, Map.Entry<String, String> entry) throws Exception {

        XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String messageId = entry.getKey();
		String generatedmessageId= entry.getValue();

        log.debug("Update Message ID: " + messageId + ". New Message ID: " + generatedmessageId);

		//update header_id to generated header_id
		if(!messageId.equals(generatedmessageId)) {

			NodeList messageNodes = (NodeList) xPath.compile("/dil/core/messages/message[id=" + messageId + "]/id/text()").evaluate(doc, XPathConstants.NODESET);
            messageNodes.item(0).setTextContent("id" + generatedmessageId);

			NodeList headersIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/*/*/options[header_id=" + messageId + "]/header_id").evaluate(doc, XPathConstants.NODESET);

			for (int i = 0; i < headersIdNodes.getLength(); i++) {
				headersIdNodes.item(i).setTextContent("id" + generatedmessageId);
			}
		}
	}
}
