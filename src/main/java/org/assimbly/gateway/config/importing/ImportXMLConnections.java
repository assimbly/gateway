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
import javax.xml.xpath.XPathFactory;
import java.util.*;

@Service
@Transactional
public class ImportXMLConnections {

    private final Logger log = LoggerFactory.getLogger(ImportXMLConnections.class);

	@Autowired
	private ConnectionRepository connectionRepository;
	private Connection connection;
    private Map<String, String> connectionsIdMap;

	public String xmlConfiguration;

    public String configuration;

	private Set<ConnectionKeys> connectionKeys;

	public void setConnectionsFromXML(Document doc) throws Exception {

        List<String> connectionIds = ImportXMLUtil.getList(doc, "dil/core/connections/connection/id/text()");

        if(connectionIds==null || connectionIds.size() == 0){
            return;
        }

        log.info("Importing connections");

        XPath xPath = XPathFactory.newInstance().newXPath();
        connectionsIdMap = new HashMap<String, String>();



		for (String connectionId : connectionIds) {
			setConnectionFromXml(doc, connectionId);
		}

        for (Map.Entry<String, String> entry : connectionsIdMap.entrySet()) {
			updateConnectionIdsFromXml(doc, entry);
        }

        NodeList connectionsIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/*/block[type='connection']/id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < connectionsIdNodes.getLength(); i++) {
            String updateId =  connectionsIdNodes.item(i).getTextContent();
            connectionsIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList connectionsNodes = (NodeList) xPath.compile("/dil/integrations/integration/connections/*/id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < connectionsNodes.getLength(); i++) {
            String updateId =  connectionsNodes.item(i).getTextContent();
            connectionsNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        log.info("Importing connections finished");

	}

	public void setConnectionFromXml(Document doc, String connectionId) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String connectionName = xPath.evaluate("/dil/core/connections/connection[id='" + connectionId + "']/name",doc);
		String connectionType = xPath.evaluate("/dil/core/connections/connection[id='" + connectionId + "']/type",doc);

		log.info("Start importing connection: " + connectionName);

		try {
			Optional<Connection> connectionOptional = connectionRepository.findByName(connectionName);

			if(!connectionOptional.isPresent()) {

                log.debug("Create new connection: " + connectionName);

                connection = new Connection();
				connectionKeys = new HashSet<ConnectionKeys>();
				connection.setId(null);
				connection.setName(connectionName);
				connection.setType(connectionType);
			} else {
                log.debug("Update connection: " + connectionName);
				connection = connectionOptional.get();
				if (connectionName != null) {
					connection.setName(connectionName);
				} else {
					connection.setName(connectionId);
				}
				connection.setType(connectionType);

                connectionKeys = connection.getConnectionKeys();

			}
		} catch (NumberFormatException nfe) {
			connection = new Connection();
			connectionKeys = new HashSet<ConnectionKeys>();
			if (connectionName != null) {
				connection.setName(connectionName);
			} else {
				connection.setName(connectionId);
			}
			connection.setType(connectionType);

		}

        log.debug("Get Connection Keys: " + connectionName);

        Map<String, String> connectionMap = ImportXMLUtil.getMap(doc,"/dil/core/connections/connection[id='" + connectionId + "']/keys/*");
		Map<String, ConnectionKeys> map = new HashMap<>();
		for (ConnectionKeys s : connectionKeys) {
			map.put(s.getKey(), s);
		}

        log.debug("Set Connection Keys: " + connectionName);

        for (Map.Entry<String, String> entry : connectionMap.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			ConnectionKeys connectionKey;

			if (key.equals("type")) {
				connection.setType(key);
			} else if (map.containsKey(key)) {
				connectionKey = map.get(key);
				connectionKey.setKey(key);
				connectionKey.setValue(value);
				connectionKeys.add(connectionKey);

			} else {
				connectionKey = new ConnectionKeys();
				connectionKey.setKey(key);
				connectionKey.setValue(value);
				connectionKey.setType(null);
				connectionKey.setConnection(connection);
				connectionKeys.add(connectionKey);
			}
		}


        if (connection != null && connectionKeys != null) {

            log.debug("Import into database: " + connectionName);

            connection = connectionRepository.save(connection);

			//save connectionkeys
			connection.setConnectionKeys(connectionKeys);
			connection = connectionRepository.save(connection);

			String generatedConnectionId = connection.getId().toString();

			connectionsIdMap.put(connectionId, generatedConnectionId);

			connection = null;
			connectionKeys = null;
		}

        log.info("Finish importing connection: " + connectionName);

    }

	public void updateConnectionIdsFromXml(Document doc, Map.Entry<String, String> entry) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String connectionId = entry.getKey();
		String generatedConnectionId= entry.getValue();

        log.debug("Update Connection ID: " + connectionId + ". New Connection ID: " + generatedConnectionId);

		//update connection id to the generated id
		if(!connectionId.equals(generatedConnectionId)) {

			NodeList connectionsIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/*/block[id='" + connectionId + "']/id").evaluate(doc, XPathConstants.NODESET);

			for (int i = 0; i < connectionsIdNodes.getLength(); i++) {
				connectionsIdNodes.item(i).setTextContent("id" + generatedConnectionId);
			}

			NodeList connectionsNodes = (NodeList) xPath.compile("/dil/core/connections/connection[id='" + connectionId + "']/id").evaluate(doc, XPathConstants.NODESET);

			connectionsNodes.item(0).setTextContent("id" + generatedConnectionId);

		}

	}

}
