package org.assimbly.gateway.config.importing;

import org.assimbly.dil.transpiler.transform.Transform;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.service.dto.FlowImportResultDTO;
import org.assimbly.gateway.service.importing.FlowImportException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.util.List;

@Service
public class Import {

	@Autowired
	private ImportXMLGateways importXMLGateways;

    @Autowired
    private ImportXMLFlows importXMLFlows;

    @Autowired
    private ImportXMLMessages importXMLMessages;

    @Autowired
    private ImportXMLRoutes importXMLRoutes;

    @Autowired
    private ImportXMLConnections importXMLConnections;

    @Autowired
    private FlowRepository flowRepository;

	// imports gateway configuration (complete configuration file)
	public String convertConfigurationToDB(Long integrationId, String mediaType, String configuration) throws Exception {

		if(!configuration.endsWith("</dil>")){
			configuration = new Transform("transform-to-dil.xsl").transformToDil(configuration);
		}

		// get the configuration as XML Document
		Document doc = ImportXMLUtil.getDocument(mediaType, configuration);

		// create gateway
        importXMLGateways.setGatewayFromXML(doc, integrationId);

		return "ok";

	}

	// imports flow configuration (specific flow)
	public String convertFlowConfigurationToDB(Long integrationId, Long flowId, String mediaType, String flowConfiguration)	throws Exception {

		String dilConfiguration = flowConfiguration.strip();
		if(!dilConfiguration.endsWith("</dil>")){
            dilConfiguration = new Transform("transform-to-dil.xsl").transformToDil(dilConfiguration);
		}

		Document doc = ImportXMLUtil.getDocument(mediaType, dilConfiguration);

		importXMLMessages.setMessagesFromXML(doc);

		importXMLRoutes.setRoutesFromXML(doc,"routes");

        importXMLRoutes.setRoutesFromXML(doc,"routeConfigurations");

		importXMLConnections.setConnectionsFromXML(doc);

		importXMLFlows.setFlowFromXML(doc, integrationId, Long.toString(flowId));

		return "ok";

	}

    /**
     * Imports the one Flow of a DIL document and says which Flow it became. A Flow is matched by name: when there is
     * one already it is replaced, or, with {@code rename}, the imported Flow gets a name no other Flow has.
     */
    public FlowImportResultDTO importFlow(Long integrationId, String mediaType, String flowConfiguration, boolean rename) throws Exception {

        String dilConfiguration = flowConfiguration.strip();
        // JSON is converted to XML first, as the runtime does when it installs a DIL flow
        if (mediaType.contains("json")) {
            dilConfiguration = DocConverter.jsonToXml(dilConfiguration).strip();
            mediaType = MediaType.APPLICATION_XML_VALUE;
        }
        if(!dilConfiguration.endsWith("</dil>")){
            dilConfiguration = new Transform("transform-to-dil.xsl").transformToDil(dilConfiguration);
        }

        Document doc = ImportXMLUtil.getDocument(mediaType, dilConfiguration);

        XPath xPath = XPathFactory.newInstance().newXPath();
        NodeList flows = (NodeList) xPath.evaluate("//flows/flow", doc, XPathConstants.NODESET);
        if (flows.getLength() == 0) {
            throw new FlowImportException("The file doesn't contain a Flow.");
        }
        if (flows.getLength() > 1) {
            throw new FlowImportException("The file contains " + flows.getLength() + " Flows. Import it as a Gateway backup instead.");
        }

        String flowId = xPath.evaluate("id", flows.item(0)).strip();
        Node nameNode = (Node) xPath.evaluate("name", flows.item(0), XPathConstants.NODE);
        String name = nameNode == null ? "" : nameNode.getTextContent().strip();
        if (flowId.isEmpty() || name.isEmpty()) {
            throw new FlowImportException("The Flow in the file has no id or no name.");
        }

        boolean exists = flowRepository.findByName(name).isPresent();
        boolean replaced = exists && !rename;
        if (exists && rename) {
            name = uniqueName(name);
            nameNode.setTextContent(name);
        }

        importXMLMessages.setMessagesFromXML(doc);

        importXMLRoutes.setRoutesFromXML(doc,"routes");

        importXMLRoutes.setRoutesFromXML(doc,"routeConfigurations");

        importXMLConnections.setConnectionsFromXML(doc);

        Flow flow = importXMLFlows.setFlowFromXML(doc, integrationId, flowId);
        if (flow == null) {
            throw new FlowImportException("The Flow could not be imported: Integration " + integrationId + " doesn't exist.");
        }

        return new FlowImportResultDTO(flow.getId(), flow.getName(), flow.getType(), replaced, List.of());
    }

    private String uniqueName(String name) {
        String candidate = name;
        for (int n = 2; flowRepository.findFirstByNameOrderByIdAsc(candidate).isPresent(); n++) {
            candidate = name + "-" + n;
        }
        return candidate;
    }

}
