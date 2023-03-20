package org.assimbly.gateway.config.importing;

import java.util.*;

import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;

@Service
@Transactional
public class ImportXMLGateways {

    private final Logger log = LoggerFactory.getLogger(ImportXMLGateways.class);

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private ImportXMLFlows importXMLFlows;

    @Autowired
    private ImportXMLMessages importXMLMessages;

    @Autowired
    private ImportXMLRoutes importXMLRoutes;

    @Autowired
    private ImportXMLConnections importXMLConnections;

    @Autowired
    private ImportXMLEnvironmentVariables importXMLEnvironmentVariables;

	public String xmlConfiguration;
	public String configuration;

    private Optional<Integration> integrationOptional;
    private Integration integration;

	public void setGatewayFromXML(Document doc, Long integrationIdLong) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
		String integrationId = xPath.evaluate("//integrations/integration/id", doc);
		String name = xPath.evaluate("//integrations/integration/name", doc);
		String type = xPath.evaluate("//integrations/integration/type", doc);
		String environmentName = xPath.evaluate("//integrations/integration/options/environment", doc);
		String stage = xPath.evaluate("//integrations/integration/options/stage", doc);
		String defaultFromComponentType = xPath.evaluate("//integrations/integration/options/defaultFromComponentType", doc);
		String defaultToComponentType = xPath.evaluate("//integrations/integration/options/defaultToComponentType", doc);
		String defaultErrorComponentType = xPath.evaluate("//integrations/integration/options/defaultErrorComponentType", doc);

        if (defaultFromComponentType.isEmpty()) {defaultFromComponentType = "file";}
        if (defaultToComponentType.isEmpty()) {defaultToComponentType = "file";}
        if (defaultErrorComponentType.isEmpty()) {defaultErrorComponentType = "file";}

		log.info("IntegrationId=" + integrationId);

		if (!integrationId.isEmpty()) {

			log.info("Importing integration: " + name);

			integrationOptional = integrationRepository.findById(integrationIdLong);

			if (!integrationOptional.isPresent()) {
				integration = new Integration();
			}else {
				integration = integrationOptional.get();
			}

            if (type == null || type.isEmpty()) {
                type = "FULL";
            }else {
                try {
                    GatewayType.valueOf(type);
                }catch (Exception e){
                    type = "FULL";
                }
            }

			integration.setId(integrationIdLong);
			integration.setName(name);
			integration.setEnvironmentName(environmentName);
			integration.setType(GatewayType.valueOf(type));
			integration.setStage(EnvironmentType.valueOf(stage));
			integration.setDefaultFromComponentType(defaultFromComponentType);
			integration.setDefaultToComponentType(defaultToComponentType);
			integration.setDefaultErrorComponentType(defaultErrorComponentType);

            // create environment variables
            importXMLEnvironmentVariables.setEnvironmentVariablesFromXML(doc, integrationIdLong, integration);

            integrationRepository.save(integration);

            log.info("Importing integrations finished");

            importXMLMessages.setMessagesFromXML(doc);

            importXMLRoutes.setRoutesFromXML(doc,"routes");

            importXMLRoutes.setRoutesFromXML(doc,"routeConfigurations");

            importXMLConnections.setConnectionsFromXML(doc);

            importXMLFlows.setFlowsFromXML(doc, integrationIdLong);

			log.info("Importing finished");

		}else {
			log.error("Can't import integration. No valid integration id found.");
			throw new Exception("Can't import integration. No valid integration id found.");
		}
	}

}
