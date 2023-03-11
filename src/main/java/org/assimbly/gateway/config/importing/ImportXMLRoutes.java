package org.assimbly.gateway.config.importing;

import org.assimbly.docconverter.DocConverter;
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
	private Map<String, String> routesIdMap;

	public String xmlConfiguration;
	public String configuration;

    private String baseXpath;

	private long routeIdLong;


	public String setRoutesFromXML(Document doc, String type) throws Exception {

        if(type.equalsIgnoreCase("routeConfigurations")){
            log.info("Importing " + type);
            baseXpath = "/dil/core/routeConfigurations/routeConfiguration";

        }else{
            log.info("Importing " + type);
            baseXpath = "/dil/core/routes/route";
        }

        // create routes
		List<String> routeIds = ImportXMLUtil.getList(doc, baseXpath + "/@id");

        if(routeIds==null || routeIds.size() == 0){
            return "no " + type;
        }

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

        routesIdMap = new HashMap<String, String>();

		for (String routeId : routeIds) {
			setRouteFromXML(doc, routeId);
		}

        for (Map.Entry<String, String> entry : routesIdMap.entrySet()) {
			updateRouteIdsFromXml(doc, entry);
        }

        NodeList routesIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/*/*/options/route_id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < routesIdNodes.getLength(); i++) {
            String updateId =  routesIdNodes.item(i).getTextContent();
            routesIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList routesNodes = (NodeList) xPath.compile(baseXpath).evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < routesNodes.getLength(); i++) {
            Node currentItem = routesNodes.item(i);
			String updateId = currentItem.getAttributes().getNamedItem("id").getNodeValue();
            currentItem.getAttributes().getNamedItem("id").setTextContent(updateId.replace("id",""));
        }

        log.info("Importing " + type + " finished");

        return "ok";

	}

	public void setRouteFromXML(Document doc, String routeId) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

        String routeName = xPath.evaluate(baseXpath + "[id=" + routeId + "]/name", doc);

        log.info("Start importing route: " + routeName);

        NodeList routeNodes = (NodeList) xPath.compile(baseXpath + "[@id='" + routeId + "']").evaluate(doc, XPathConstants.NODESET);
        Node node = routeNodes.item(0);
        String routeContent = TransformUtil.nodeToString(node);


        try {
			routeIdLong = Long.parseLong(routeId, 10);
			Optional<Route> routeOptional = routeRepository.findById(routeIdLong);

			if (!routeOptional.isPresent()) {
                log.debug("Create new route: " + routeName);

                route = new Route();
				route.setId(null);
				route.setName(routeId);
				route.setType("xml");
				route.setContent(routeContent);

			} else {
                log.debug("Update route: " + routeName);
                route = routeOptional.get();
			}
		} catch (NumberFormatException nfe) {
			route = new Route();
			route.setName(routeId);
			route.setType("xml");
			route.setContent(routeContent);
		}

        log.debug("Import into database: " + routeName);

        if (route != null) {

			route = routeRepository.save(route);

			String generatedRouteId = route.getId().toString();

			routesIdMap.put(routeId, generatedRouteId);

			route = null;
		}

        log.info("Finish importing route: " + routeName);

    }

	public void updateRouteIdsFromXml(Document doc, Map.Entry<String, String> entry) throws Exception {

        XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String routeId = entry.getKey();
		String generatedRouteId= entry.getValue();

        log.debug("Update Route ID: " + routeId + ". New Route ID: " + generatedRouteId);

		//update route_id to generated route_id
		if(!routeId.equals(generatedRouteId)) {

			NodeList routeNodes = (NodeList) xPath.compile(baseXpath + "[@id='" + routeId + "']").evaluate(doc, XPathConstants.NODESET);

            routeNodes.item(0).getAttributes().getNamedItem("id").setTextContent("id" + generatedRouteId);

            NodeList routesIdNodes = (NodeList) xPath.compile("/dil/integrations/integration/flows/flow/*/*/*/*/options[route_id='" + routeId + "']/route_id").evaluate(doc, XPathConstants.NODESET);

			for (int i = 0; i < routesIdNodes.getLength(); i++) {
				routesIdNodes.item(i).setTextContent("id" + generatedRouteId);
			}


        }

	}

}
