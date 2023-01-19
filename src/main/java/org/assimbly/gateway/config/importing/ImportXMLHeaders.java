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
public class ImportXMLHeaders {

    private final Logger log = LoggerFactory.getLogger(ImportXMLHeaders.class);

	public String options;
	public String componentType;
	public String uri;

	@Autowired
	private HeaderRepository headerRepository;

	public String xmlConfiguration;
	public String configuration;

    private Header header;
    private Map<String, String> headersIdMap;

    private Set<HeaderKeys> headerKeys;

	public String setHeadersFromXML(Document doc) throws Exception {

        log.info("Importing headers");

        // create headers
		List<String> headerIds = ImportXMLUtil.getList(doc, "/dil/core/headers/header/id/text()");

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

        headersIdMap = new HashMap<String, String>();

        for (String headerId : headerIds) {
			setHeaderFromXML(doc, headerId);
		}

        for (Map.Entry<String, String> entry : headersIdMap.entrySet()) {
			updateHeaderIdsFromXml(doc, entry);
        }

        NodeList headersIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/header_id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < headersIdNodes.getLength(); i++) {
            String updateId =  headersIdNodes.item(i).getTextContent();
            headersIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList headersNodes = (NodeList) xPath.compile("/dil/core/headers/*/id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < headersNodes.getLength(); i++) {
            String updateId =  headersNodes.item(i).getTextContent();
            headersNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        log.info("Importing headers finished");

        return "ok";

	}

	public void setHeaderFromXML(Document doc, String headerId) throws Exception {

        XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String headerName = xPath.evaluate("/dil/core/headers/header[id=" + headerId + "]/name", doc);

        log.info("Start importing header: " + headerName);

		try {
			Long.parseLong(headerId, 10);
			Optional<Header> headerOptional = headerRepository.findByName(headerName);

			if (!headerOptional.isPresent()) {
                log.debug("Create new header: " + headerName);
                header = new Header();
				headerKeys = new HashSet<HeaderKeys>();
				header.setId(null);
				if (headerName == null || headerName.isEmpty()) {
					header.setName(headerId);
				} else {
					header.setName(headerName);
				}
			} else {
                log.debug("Update header: " + headerName);
				header = headerOptional.get();
				headerKeys = header.getHeaderKeys();
			}
		} catch (NumberFormatException nfe) {
			header = new Header();
			headerKeys = new HashSet<HeaderKeys>();
			if (headerName == null || headerName.isEmpty()) {
				header.setName(headerId);
			} else {
				header.setName(headerName);
			}
		}

        log.debug("Get Header Keys: " + headerName);

        Map<String, HeaderKeys> map = new HashMap<>();
		for (HeaderKeys s : headerKeys) {
			map.put(s.getKey(), s);
		}

        log.debug("Set Header Keys: " + headerName);

        // Create XPath object
		XPathExpression expr = xPath.compile("/dil/core/headers/header[id=" + headerId + "]/keys/*");

		NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
		for (int i = 0; i < nodes.getLength(); i++) {

			String key = nodes.item(i).getNodeName();
			String value = nodes.item(i).getTextContent();
			HeaderKeys headerKey;
			Node headerKeyType = nodes.item(i).getAttributes().getNamedItem("type");
			String type = "constant";

			if (headerKeyType != null) {
				type = headerKeyType.getTextContent();
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
				headerKey.setHeader(header);
				headerKeys.add(headerKey);
			}
		}

		if (header != null && headerKeys != null) {

            log.debug("Import into database: " + headerName);

            header = headerRepository.save(header);

			header.setHeaderKeys(headerKeys);
			header = headerRepository.save(header);

			String generatedHeaderId = header.getId().toString();

			headersIdMap.put(headerId, generatedHeaderId);

			header = null;
			headerKeys = null;
		}

        log.info("Finished importing header: " + headerName);

    }

	public void updateHeaderIdsFromXml(Document doc, Map.Entry<String, String> entry) throws Exception {

        XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String headerId = entry.getKey();
		String generatedHeaderId= entry.getValue();

        log.debug("Update Header ID: " + headerId + ". New Header ID: " + generatedHeaderId);

		//update header_id to generated header_id
		if(!headerId.equals(generatedHeaderId)) {

			NodeList headerNodes = (NodeList) xPath.compile("/dil/core/headers/header[id=" + headerId + "]/id/text()").evaluate(doc, XPathConstants.NODESET);
			headerNodes.item(0).setTextContent("id" + generatedHeaderId);

			NodeList headersIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*[header_id=" + headerId + "]/header_id").evaluate(doc, XPathConstants.NODESET);

			for (int i = 0; i < headersIdNodes.getLength(); i++) {
				headersIdNodes.item(i).setTextContent("id" + generatedHeaderId);
			}
		}
	}
}
