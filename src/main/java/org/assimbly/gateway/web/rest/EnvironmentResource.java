package org.assimbly.gateway.web.rest;

import io.swagger.annotations.ApiParam;

import org.assimbly.gateway.config.environment.DBConfiguration;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.codahale.metrics.annotation.Timed;

import java.net.URISyntaxException;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@RestController
@RequestMapping("/api")
public class EnvironmentResource {

	@Autowired
    private DBConfiguration DBConfiguration;
    
	private String configuration;
    
	/**
     * POST  /configuration/{gatewayid}/setconfiguration : Set configuration from XML.
     *
     * @param gatewayid (by gatewayId)
     * @param configuration as xml
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/environment/{gatewayid}", produces = {"text/plain","application/xml", "application/json"})
    @Timed
    public ResponseEntity<String> setGatewayConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long gatewayid, @RequestBody String configuration) throws Exception {

       	try {        	
        	DBConfiguration.convertConfigurationToDB(gatewayid, mediaType, configuration);
        	mediaType="text/plain";
        	return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "setConfiguration", "Connector configuration set");
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "setConfiguration", "Connector configuration set",e);
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
    @Timed
    public ResponseEntity<String> getGatewayConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long gatewayid) throws Exception {

       	try {
			configuration = DBConfiguration.convertDBToConfiguration(gatewayid, mediaType);
			return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "getFlowConfiguration", configuration, true);
       		
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getConfiguration", configuration, e);
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
    @PostMapping(path = "/environment/{gatewayid}/flow/{flowid}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> setFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long gatewayid, @PathVariable Long flowid, @RequestBody String configuration) throws Exception {
       	try {
       		DBConfiguration.convertFlowConfigurationToDB(gatewayid, flowid, mediaType, configuration);
			return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "setFlowConfiguration", "Flow configuration set");
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "setFlowConfiguration", "Flow configuration set", e);
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
    @Timed
    public ResponseEntity<String> getFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long gatewayid, @PathVariable Long flowid) throws Exception {
       	try {
            configuration = DBConfiguration.convertDBToFlowConfiguration(flowid, mediaType);
			return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "getFlowConfiguration", configuration, true);
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getFlowConfiguration", "Flow configuration get", e);
   		}
    }    
}