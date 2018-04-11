package org.assimbly.gateway.web.rest;

import io.github.jhipster.config.JHipsterProperties;
import io.swagger.annotations.ApiParam;

import org.assimbly.gateway.config.flows.AssimblyDBConfiguration;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
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

    private final Environment env;

    private final JHipsterProperties jHipsterProperties;

	private String xmlconfiguration;

	@Autowired
	private AssimblyDBConfiguration assimblyDBConfiguration;
	
    public ConfigurationResource(Environment env, JHipsterProperties jHipsterProperties) {
        this.env = env;
        this.jHipsterProperties = jHipsterProperties;
    }
    
    //configure gateway from database (by gatewayid)
    
    /**
     * POST  /configuration/{connectorid}/setconfiguration : Set configuration from XML.
     *
     * @param connectorId (by gatewayId)
     * @param configuration as xml
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/configuration/{connectorId}/setconfiguration", consumes = "application/xml", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> setConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@RequestBody String xmlConfiguration) throws Exception {

       	try {
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
    @GetMapping(path = "/configuration/{connectorId}/getconfiguration", consumes = "application/xml", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

    	mediaType="text/plain";
    	
       	try {
			xmlconfiguration = assimblyDBConfiguration.convertDBToXMLConfiguration(connectorId);
			
       		return ResponseUtil.createSuccessResponse(connectorId, mediaType,"getConfiguration",xmlconfiguration);
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"getConfiguration",xmlconfiguration,e);
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
    public ResponseEntity<String> setFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@PathVariable Long id,@RequestBody String xmlConfiguration) throws Exception {

       	try {
       		mediaType = "application/json";
			
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

    	mediaType="text/plain";
    	
       	try {
			xmlconfiguration = assimblyDBConfiguration.convertDBToXMLFlowConfiguration(id);
			
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setFlowConfiguration",xmlconfiguration);
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"setFlowConfiguration","Flow configuration set",e);
   		}
    }    
}