package org.assimbly.gateway.config.importing;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.*;
import org.assimbly.util.TransformUtil;
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
import javax.xml.xpath.XPathFactory;
import java.util.*;

@Service
@Transactional
public class ImportXMLRoutes {

    private final Logger log = LoggerFactory.getLogger(ImportXMLRoutes.class);

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	public String options;
	public String componentType;
	public String uri;

    @Autowired
    private RouteRepository routeRepository;

	private Route route;
	private Map<String, String> routesIdMap = new HashMap<String, String>();

	public String xmlConfiguration;
	public String configuration;

	private long routeIdLong;


	public String setRoutesFromXML(Document doc) throws Exception {

        log.info("Importing routes");

        // create routes
		List<String> routeIds = ImportXMLUtil.getList(doc, "/integrations/integration/routes/route/@id");

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		for (String routeId : routeIds) {
			setRouteFromXML(doc, routeId);
		}

        for (Map.Entry<String, String> entry : routesIdMap.entrySet()) {
			updateRouteIdsFromXml(doc, entry);
        }

        NodeList routesIdNodes = (NodeList) xPath.compile("/integrations/integration/flows/flow/*/*/route_id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < routesIdNodes.getLength(); i++) {
            String updateId =  routesIdNodes.item(i).getTextContent();
            routesIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList routesNodes = (NodeList) xPath.compile("/integrations/integration/routes/route").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < routesNodes.getLength(); i++) {
            Node currentItem = routesNodes.item(i);
			String updateId = currentItem.getAttributes().getNamedItem("id").getNodeValue();
            currentItem.getAttributes().getNamedItem("id").setTextContent(updateId.replace("id",""));
        }

        log.info("Importing routes finished");

        return "ok";

	}

	public void setRouteFromXML(Document doc, String routeId) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

        NodeList routeNodes = (NodeList) xPath.compile("/integrations/integration/routes/route[@id='" + routeId + "']").evaluate(doc, XPathConstants.NODESET);
        Node node = routeNodes.item(0);
        String routeContent = TransformUtil.nodeToString(node);

        try {
			routeIdLong = Long.parseLong(routeId, 10);
			Optional<Route> routeOptional = routeRepository.findById(routeIdLong);

			if (!routeOptional.isPresent()) {
				route = new Route();
				route.setId(null);
				route.setName(routeId);
				route.setType("xml");
				route.setContent(routeContent);

			} else {
				route = routeOptional.get();
			}
		} catch (NumberFormatException nfe) {
			route = new Route();
			route.setName(routeId);
			route.setType("xml");
			route.setContent(routeContent);
		}

		if (route != null) {

			route = routeRepository.save(route);

			String generatedRouteId = route.getId().toString();

			routesIdMap.put(routeId, generatedRouteId);

			route = null;
		}

	}

	public void updateRouteIdsFromXml(Document doc, Map.Entry<String, String> entry) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String routeId = entry.getKey();
		String generatedRouteId= entry.getValue();

		//update route_id to generated route_id
		if(!routeId.equals(generatedRouteId)) {

			NodeList routeNodes = (NodeList) xPath.compile("/integrations/integration/routes/route[@id='" + routeId + "']").evaluate(doc, XPathConstants.NODESET);
			routeNodes.item(0).getAttributes().getNamedItem("id").setTextContent("id" + generatedRouteId);

			NodeList servicesIdNodes = (NodeList) xPath.compile("/integrations/integration/flows/flow/*/*[route_id='" + routeId + "']/route_id").evaluate(doc, XPathConstants.NODESET);

			for (int i = 0; i < servicesIdNodes.getLength(); i++) {
				servicesIdNodes.item(i).setTextContent("id" + generatedRouteId);
			}

        }

	}

}
