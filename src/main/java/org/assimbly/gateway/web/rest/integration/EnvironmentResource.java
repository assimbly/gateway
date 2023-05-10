package org.assimbly.gateway.web.rest.integration;

import io.swagger.v3.oas.annotations.Parameter;

import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.config.importing.Import;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URISyntaxException;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@RestController
@RequestMapping("/api")
public class EnvironmentResource {

    private final Logger log = LoggerFactory.getLogger(EnvironmentResource.class);

	@Autowired
    private Export confExport;

	@Autowired
    private Import confImport;

	private String configuration;

	/**
     * POST  /configuration/{integrationid}/setconfiguration : Set configuration from XML.
     *
     * @param integrationid (by integrationId)
     * @param configuration as xml
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(
        path = "/environment/{integrationid}",
        consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE},
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> setGatewayConfiguration(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType,@Parameter(hidden = true) @RequestHeader("Content-Type") String contentType, @PathVariable Long integrationid, @RequestBody String configuration) throws Exception {

       	try {
       		log.info("Importing configuration into database");
        	confImport.convertConfigurationToDB(integrationid, contentType, configuration);
        	return ResponseUtil.createSuccessResponse(integrationid, mediaType, "setConfiguration", "Gateway configuration set");
   		} catch (Exception e) {
       		log.error("Import of configuration failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(integrationid, mediaType, "setConfiguration", e.getMessage());
   		}

    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param integrationid (by integrationid)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(
        path = "/environment/{integrationid}",
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getGatewayConfiguration(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @RequestHeader("PlaceholderReplacement") boolean isPlaceholderReplacement, @PathVariable Long integrationid ) throws Exception {

       	try {
			configuration = confExport.convertDBToConfiguration(integrationid, mediaType,isPlaceholderReplacement);
			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
				log.error("Failed to get configuration: " + configuration);
				return ResponseUtil.createFailureResponse(integrationid, mediaType, "getGatewayConfiguration", configuration);
			}
			return ResponseUtil.createSuccessResponse(integrationid, mediaType, "getGatewayConfiguration", configuration, true);

   		} catch (Exception e) {
            log.error("Failed to get configuration: " + e.getMessage());
            e.printStackTrace();
   			return ResponseUtil.createFailureResponse(integrationid, mediaType, "getGatewayConfiguration", e.getMessage());
   		}

    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway by list of flow ids.
     *
     * @param integrationid (by integrationid)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(
        path = "/environment/{integrationid}/byflowids",
        consumes = {MediaType.TEXT_PLAIN_VALUE},
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getConfigurationByFlowids(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @RequestHeader("PlaceholderReplacement") boolean isPlaceholderReplacement, @PathVariable Long integrationid, @RequestBody String flowids) throws Exception {

       	try {
			configuration = confExport.convertDBToConfigurationByFlowIds(integrationid, mediaType, flowids, isPlaceholderReplacement);
			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
				return ResponseUtil.createFailureResponse(integrationid, mediaType, "getConfigurationByFlowids", configuration);
			}
			return ResponseUtil.createSuccessResponse(integrationid, mediaType, "getConfigurationByFlowids", configuration, true);

   		} catch (Exception e) {
            log.error("Failed to get configuration by flowids: " + e.getMessage());
            e.printStackTrace();
   			return ResponseUtil.createFailureResponse(integrationid, mediaType, "getConfigurationByFlowids", e.getMessage());
   		}

    }

    /**
     * POST  /setflowconfiguration : Set configuration from XML.
     *
     * @param flowid (FlowId)
     * @param configuration as XML / if empty get from db (for the time being)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(
        path = "/environment/{integrationid}/flow/{flowid}",
        consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE},
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> setFlowConfiguration(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long integrationid, @PathVariable Long flowid, @RequestBody String configuration) throws Exception {
        try {
       		confImport.convertFlowConfigurationToDB(integrationid, flowid, mediaType, configuration);
			return ResponseUtil.createSuccessResponse(integrationid, mediaType, "setFlowConfiguration", "Flow configuration set");
   		} catch (Exception e) {
            log.error("Failed to set configuration: " + e.getMessage() + " for flowid=" + flowid);
            e.printStackTrace();
   			return ResponseUtil.createFailureResponse(integrationid, mediaType, "setFlowConfiguration", e.getMessage());
   		}
    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param flowid (flowId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(
        path = "/environment/{integrationid}/flow/{flowid}",
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getFlowConfiguration(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @RequestHeader("PlaceholderReplacement") boolean isPlaceholderReplacement, @PathVariable Long integrationid, @PathVariable Long flowid) throws Exception {
       	try {
            configuration = confExport.convertDBToFlowConfiguration(flowid, mediaType, isPlaceholderReplacement);

			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
				return ResponseUtil.createFailureResponse(integrationid, mediaType, "getFlowConfiguration", configuration);
			}
			return ResponseUtil.createSuccessResponse(integrationid, mediaType, "getFlowConfiguration", configuration, true);
   		} catch (Exception e) {
            log.error("Failed to get configuration: " + e.getMessage() + " for flowid=" + flowid);
            e.printStackTrace();
   			return ResponseUtil.createFailureResponse(integrationid, mediaType, "getFlowConfiguration", e.getMessage());
   		}
    }

}
