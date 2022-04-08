package org.assimbly.gateway.web.rest.integration;

import io.swagger.v3.oas.annotations.Parameter;

import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.config.importing.Import;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
     * POST  /configuration/{gatewayid}/setconfiguration : Set configuration from XML.
     *
     * @param gatewayid (by gatewayId)
     * @param configuration as xml
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/environment/{gatewayid}", consumes = {"text/plain","application/xml", "application/json"}, produces = {"text/plain","application/xml", "application/json"})
    public ResponseEntity<String> setGatewayConfiguration(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType,@Parameter(hidden = true) @RequestHeader("Content-Type") String contentType, @PathVariable Long gatewayid, @RequestBody String configuration) throws Exception {

       	try {
       		log.info("Importing configuration into database");
        	confImport.convertConfigurationToDB(gatewayid, contentType, configuration);
        	return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "setConfiguration", "Gateway configuration set");
   		} catch (Exception e) {
       		log.error("Import of configuration failed: " + e.getMessage());
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "setConfiguration", e.getMessage());
   		}

    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param gatewayid (by gatewayid)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/environment/{gatewayid}", produces = {"text/plain","application/xml", "application/json"})
    public ResponseEntity<String> getGatewayConfiguration(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @RequestHeader("PlaceholderReplacement") boolean isPlaceholderReplacement, @PathVariable Long gatewayid ) throws Exception {

       	try {
			configuration = confExport.convertDBToConfiguration(gatewayid, mediaType,isPlaceholderReplacement);
			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
				log.error("Failed to get configuration: " + configuration);
				return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getGatewayConfiguration", configuration);
			}
			return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "getGatewayConfiguration", configuration, true);

   		} catch (Exception e) {
   			log.error("Failed to get configuration: " + e.getMessage());
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getGatewayConfiguration", e.getMessage());
   		}

    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway by list of flow ids.
     *
     * @param gatewayid (by gatewayid)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/environment/{gatewayid}/byflowids", produces = {"text/plain","application/xml", "application/json"},consumes = {"text/plain"})
    public ResponseEntity<String> getConfigurationByFlowids(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @RequestHeader("PlaceholderReplacement") boolean isPlaceholderReplacement, @PathVariable Long gatewayid, @RequestBody String flowids) throws Exception {

       	try {
			configuration = confExport.convertDBToConfigurationByFlowIds(gatewayid, mediaType, flowids, isPlaceholderReplacement);
			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
				return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getConfigurationByFlowids", configuration);
			}
			return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "getConfigurationByFlowids", configuration, true);

   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getConfigurationByFlowids", e.getMessage());
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
    @PostMapping(path = "/environment/{gatewayid}/flow/{flowid}", consumes = {"text/plain","application/xml", "application/json"}, produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> setFlowConfiguration(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long gatewayid, @PathVariable Long flowid, @RequestBody String configuration) throws Exception {
        try {
       		confImport.convertFlowConfigurationToDB(gatewayid, flowid, mediaType, configuration);
			return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "setFlowConfiguration", "Flow configuration set");
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "setFlowConfiguration", e.getMessage());
   		}
    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param flowid (flowId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/environment/{gatewayid}/flow/{flowid}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowConfiguration(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @RequestHeader("PlaceholderReplacement") boolean isPlaceholderReplacement, @PathVariable Long gatewayid, @PathVariable Long flowid) throws Exception {
       	try {
            configuration = confExport.convertDBToFlowConfiguration(flowid, mediaType, isPlaceholderReplacement);

			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
				return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getFlowConfiguration", configuration);
			}
			return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "getFlowConfiguration", configuration, true);
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getFlowConfiguration", e.getMessage());
   		}
    }

}
