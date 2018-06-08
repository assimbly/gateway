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
public class ConfigurationResource {

	@Autowired
	private DBConfiguration assimblyDBConfiguration;

	private String configuration;
    
	/**
     * POST  /configuration/{connectorid}/setconfiguration : Set configuration from XML.
     *
     * @param connectorId (by gatewayId)
     * @param configuration as xml
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/configuration/{connectorId}/setconfiguration", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> setConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@RequestBody String configuration) throws Exception {

       	try {        	
        	assimblyDBConfiguration.convertConfigurationToDB(connectorId, mediaType,configuration);
        	mediaType="text/plain";
        	return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setConfiguration","Connector configuration set (not supported yet)");
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"setConfiguration","Connector configuration set",e);
   		}
    	
    }    
    
    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param connectorId (by connectorId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/configuration/{connectorId}/getconfiguration", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

       	try {
			configuration = assimblyDBConfiguration.convertDBToConfiguration(connectorId, mediaType);
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setFlowConfiguration",configuration,true);
       		
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"getConfiguration",configuration,e);
   		}

    }    

    /**
     * POST  /setflowconfiguration : Set configuration from XML.
     *
     * @param id (FlowId)
     * @param configuration as XML / if empty get from db (for the time being)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/configuration/{connectorId}/setflowconfiguration/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> setFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@PathVariable Long id,@RequestBody String configuration) throws Exception {

       	try {
       		assimblyDBConfiguration.convertFlowConfigurationToDB(connectorId, id,mediaType,configuration);
       		mediaType="text/plain";
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setFlowConfiguration","Flow configuration set (not supported yet)");
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"setFlowConfiguration","Flow configuration set",e);
   		}
    }    

    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param id (flowId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/configuration/{connectorId}/getflowconfiguration/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

       	try {
			configuration = assimblyDBConfiguration.convertDBToFlowConfiguration(id, mediaType);
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setFlowConfiguration",configuration,true);
			
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"setFlowConfiguration","Flow configuration get",e);
   		}
    }    
}