package org.assimbly.gateway.config.importing;

import org.assimbly.dil.transpiler.transform.Transform;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;

@Service
public class Import {

	private String configuration;

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

	// imports gateway configuration (complete configuration file)
	public String convertConfigurationToDB(Long integrationId, String mediaType, String configuration) throws Exception {

		if(!configuration.endsWith("</dil>")){
			configuration = new Transform().transformToDil(configuration, "");
		}

		// get the configuration as XML Document
		Document doc = ImportXMLUtil.getDocument(mediaType, configuration);

		// create gateway
        importXMLGateways.setGatewayFromXML(doc, integrationId);

		return "ok";

	}

	// imports flow configuration (specific flow)
	public String convertFlowConfigurationToDB(Long integrationId, Long id, String mediaType, String flowConfiguration)	throws Exception {

		if(!configuration.endsWith("</dil>")){
			configuration = new Transform().transformToDil(configuration, Long.toString(id));
		}

		Document doc = ImportXMLUtil.getDocument(mediaType, configuration);

		importXMLMessages.setMessagesFromXML(doc);

		importXMLRoutes.setRoutesFromXML(doc,"routes");

        importXMLRoutes.setRoutesFromXML(doc,"routeConfigurations");

		importXMLConnections.setConnectionsFromXML(doc);

		importXMLFlows.setFlowFromXML(doc, integrationId, id.toString(), id);

		return "ok";

	}

}
