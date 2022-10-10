package org.assimbly.gateway.config.importing;

import org.assimbly.dil.transpiler.transform.Transform;
import org.assimbly.util.TransformUtil;
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
    private ImportXMLHeaders importXMLHeaders;

    @Autowired
    private ImportXMLRoutes importXMLRoutes;

    @Autowired
    private ImportXMLConnections importXMLConnections;

	// imports gateway configuration (complete configuration file)
	public String convertConfigurationToDB(Long gatewayId, String mediaType, String configuration) throws Exception {

		if(!configuration.endsWith("</integration>")){
			configuration = Transform.transformToDil(configuration);
		}

		// get the configuration as XML Document
		Document doc = ImportXMLUtil.getDocument(mediaType, configuration);

		// create gateway
        importXMLGateways.setGatewayFromXML(doc, gatewayId);

		return "ok";

	}

	// imports flow configuration (specific flow)
	public String convertFlowConfigurationToDB(Long gatewayId, Long id, String mediaType, String flowConfiguration)	throws Exception {

		if(!configuration.endsWith("</integration>")){
			configuration = Transform.transformToDil(configuration);
		}

		Document doc = ImportXMLUtil.getDocument(mediaType, configuration);

		importXMLHeaders.setHeadersFromXML(doc);

		importXMLRoutes.setRoutesFromXML(doc,"routes");

        importXMLRoutes.setRoutesFromXML(doc,"routeConfigurations");

		importXMLConnections.setConnectionsFromXML(doc);

		importXMLFlows.setFlowFromXML(doc, gatewayId, id.toString(), id);

		return "ok";

	}

}
