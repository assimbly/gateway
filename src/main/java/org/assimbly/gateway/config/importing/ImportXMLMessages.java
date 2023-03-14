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

	@Autowired
	private MessageRepository messageRepository;

	public String xmlConfiguration;
	public String configuration;

    private Message message;
    private Map<String, String> messagesIdMap;

    private Set<Header> headers;

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

        NodeList messagesIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/*/*/options/message_id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < messagesIdNodes.getLength(); i++) {
            String updateId =  messagesIdNodes.item(i).getTextContent();
            messagesIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList messageNodes = (NodeList) xPath.compile("/dil/core/messages/*/id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < messageNodes.getLength(); i++) {
            String updateId =  messageNodes.item(i).getTextContent();
            messageNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        log.info("Importing messages finished");

        return "ok";

	}

	public void setMessageFromXML(Document doc, String messageId) throws Exception {

        XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String messageName = xPath.evaluate("/dil/core/messages/message[id=" + messageId + "]/name", doc);

        log.info("Start importing message: " + messageName);

		try {
			Long.parseLong(messageId, 10);
			Optional<Message> messageOptional = messageRepository.findByName(messageName);

			if (!messageOptional.isPresent()) {
                log.debug("Create new message: " + messageName);
                message = new Message();
				headers = new HashSet<Header>();
				message.setId(null);
				if (messageName == null || messageName.isEmpty()) {
					message.setName(messageId);
				} else {
					message.setName(messageName);
				}
			} else {
                log.debug("Update message: " + messageName);
				message = messageOptional.get();
				headers = message.getHeaders();
			}
		} catch (NumberFormatException nfe) {
			message = new Message();
			headers = new HashSet<Header>();
			if (messageName == null || messageName.isEmpty()) {
				message.setName(messageId);
			} else {
				message.setName(messageName);
			}
		}

        log.debug("Get Header: " + messageName);

        Map<String, Header> map = new HashMap<>();
		for (Header s : headers) {
			map.put(s.getKey(), s);
		}

        log.debug("Set Header: " + messageName);

        // Create XPath object
		XPathExpression expr = xPath.compile("/dil/core/messages/message[id='" + messageId + "']/headers/*");

		NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < nodes.getLength(); i++) {

			String key = nodes.item(i).getNodeName();
			String value = nodes.item(i).getTextContent();
			Header header;
			Node headerType = nodes.item(i).getAttributes().getNamedItem("type");
			String type = "header";
            Node headerLanguage = nodes.item(i).getAttributes().getNamedItem("language");
            String language = "constant";

			if (headerType != null) {
				type = headerType.getTextContent();
			}

            if (headerLanguage != null) {
                language = headerLanguage.getTextContent();
            }

			if (map.containsKey(key)) {
				header = map.get(key);
				header.setKey(key);
				header.setValue(value);
				headers.add(header);

			} else {
                header = new Header();
				header.setKey(key);
				header.setValue(value);
				header.setType(type);
                header.setLanguage(language);
                header.setMessage(message);
				headers.add(header);
			}
		}

		if (message != null && headers != null) {

            log.debug("Import into database: " + messageName);

            message = messageRepository.save(message);

			message.setHeaders(headers);

			message = messageRepository.save(message);

			String generatedmessageId = message.getId().toString();

			messagesIdMap.put(messageId, generatedmessageId);

			message = null;
			headers = null;
		}

        log.info("Finished importing message: " + messageName);

    }

	public void updateMessageIdsFromXml(Document doc, Map.Entry<String, String> entry) throws Exception {

        XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String messageId = entry.getKey();
		String generatedmessageId= entry.getValue();

        log.debug("Update Message ID: " + messageId + ". New Message ID: " + generatedmessageId);

		//update message_id to generated message_id
		if(!messageId.equals(generatedmessageId)) {

			NodeList messageNodes = (NodeList) xPath.compile("/dil/core/messages/message[id=" + messageId + "]/id/text()").evaluate(doc, XPathConstants.NODESET);
            messageNodes.item(0).setTextContent("id" + generatedmessageId);

			NodeList messagesIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/*/*/options[message_id=" + messageId + "]/message_id").evaluate(doc, XPathConstants.NODESET);

			for (int i = 0; i < messagesIdNodes.getLength(); i++) {
				messagesIdNodes.item(i).setTextContent("id" + generatedmessageId);
			}
		}
	}
}
