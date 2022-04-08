package org.assimbly.gateway.config.importing;

import java.util.*;

import org.assimbly.gateway.domain.Gateway;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.repository.GatewayRepository;
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

	public String options;
	public String componentType;
	public String uri;

    @Autowired
    private GatewayRepository gatewayRepository;

    @Autowired
    private ImportXMLFlows importXMLFlows;

    @Autowired
    private ImportXMLHeaders importXMLHeaders;

    @Autowired
    private ImportXMLRoutes importXMLRoutes;

    @Autowired
    private ImportXMLServices importXMLServices;

    @Autowired
    private ImportXMLEnvironmentVariables importXMLEnvironmentVariables;

	public String xmlConfiguration;
	public String configuration;

    private Optional<Gateway> gatewayOptional;
    private Gateway gateway;

	public void setGatewayFromXML(Document doc, Long integrationId) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
		String gatewayId = xPath.evaluate("//integrations/integration/id", doc);
		String name = xPath.evaluate("//integrations/integration/name", doc);
		String type = xPath.evaluate("//integrations/integration/type", doc);
		String environmentName = xPath.evaluate("//integrations/integration/environmentName", doc);
		String stage = xPath.evaluate("//integrations/integration/stage", doc);
		String defaultFromComponentType = xPath.evaluate("//integrations/integration/defaultFromComponentType", doc);
		String defaultToComponentType = xPath.evaluate("//integrations/integration/defaultToComponentType", doc);
		String defaultErrorComponentType = xPath.evaluate("//integrations/integration/defaultErrorComponentType", doc);

        if (defaultFromComponentType.isEmpty()) {defaultFromComponentType = "file";}
        if (defaultToComponentType.isEmpty()) {defaultToComponentType = "file";}
        if (defaultErrorComponentType.isEmpty()) {defaultErrorComponentType = "file";}

		log.info("GatewayID=" + gatewayId);

		if (!gatewayId.isEmpty()) {

			log.info("Importing gateway: " + name);

			gatewayOptional = gatewayRepository.findById(integrationId);

			if (!gatewayOptional.isPresent()) {
				gateway = new Gateway();
			}else {
				gateway = gatewayOptional.get();
			}

            if (type == null || type.isEmpty()) {
                type = "connector";
            }else {
                try {
                    GatewayType.valueOf(type);
                }catch (Exception e){
                    type = "connector";
                }
            }

			gateway.setId(integrationId);
			gateway.setName(name);
			gateway.setEnvironmentName(environmentName);
			gateway.setType(GatewayType.valueOf(type));
			gateway.setStage(EnvironmentType.valueOf(stage));
			gateway.setDefaultFromComponentType(defaultFromComponentType);
			gateway.setDefaultToComponentType(defaultToComponentType);
			gateway.setDefaultErrorComponentType(defaultErrorComponentType);

            // create environment variables
            importXMLEnvironmentVariables.setEnvironmentVariablesFromXML(doc, integrationId, gateway);

            gatewayRepository.save(gateway);

            log.info("Importing gateway finished");

            importXMLHeaders.setHeadersFromXML(doc);

            importXMLRoutes.setRoutesFromXML(doc);

            importXMLServices.setServicesFromXML(doc);

            importXMLFlows.setFlowsFromXML(doc, integrationId);

			log.info("Importing finished");

		}else {
			log.error("Can't import gateway. No valid gateway id found.");
			throw new Exception("Can't import gateway. No valid gateway id found.");
		}
	}

}
