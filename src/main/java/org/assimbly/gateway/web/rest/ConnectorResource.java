package org.assimbly.gateway.web.rest;

import io.github.jhipster.config.JHipsterProperties;
import io.swagger.annotations.ApiParam;

import org.assimbly.connector.Connector;
import org.assimbly.connector.impl.CamelConnector;
import org.assimbly.gateway.config.flows.AssimblyDBConfiguration;
import org.assimbly.gateway.web.rest.util.BodyUtil;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.codahale.metrics.annotation.Timed;

import java.net.URISyntaxException;
import java.util.List;
import java.util.TreeMap;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@RestController
@EnableWebMvc
@RequestMapping("/api")
public class ConnectorResource {

    private final Logger log = LoggerFactory.getLogger(ConnectorResource.class);

    private final Environment env;

    private final JHipsterProperties jHipsterProperties;

	private Connector connector = new CamelConnector();

	private String flowId;


	private List<TreeMap<String,String>> configuration;
	private TreeMap<String, String> flowconfiguration;
	private String xmlconfiguration;

	@Autowired
	private AssimblyDBConfiguration assimblyDBConfiguration;

	private ResponseEntity<String> response;
	
    public ConnectorResource(Environment env, JHipsterProperties jHipsterProperties) {
        this.env = env;
        this.jHipsterProperties = jHipsterProperties;
    }
    
    //configure connector (by gatewayid)
    
    /**
     * POST  /connector/{connectorid}/setconfiguration : Set configuration from XML.
     *
     * @param connectorId (by gatewayId)
     * @param configuration as xml
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/connector/{connectorId}/setconfiguration", consumes = "application/xml", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> setConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@RequestBody String xmlConfiguration) throws Exception {

       	try {
       		configuration = connector.convertXMLToConfiguration(connectorId.toString(), xmlConfiguration);
			connector.setConfiguration(configuration);
   			return createSuccessResponse(connectorId, mediaType,"setConfiguration","Connector configuration set");
   		} catch (Exception e) {
   			return createFailureResponse(connectorId, mediaType,"setConfiguration","Connector configuration set",e);
   		}
    	
    }    
    
    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param connectorId (by connectorId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/connector/{connectorId}/getconfiguration", consumes = "application/xml", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

       	try {
			configuration = connector.getConfiguration();
			xmlconfiguration = connector.convertConfigurationToXML(connectorId.toString(), configuration);
   			return createSuccessResponse(connectorId, mediaType,"getConfiguration",xmlconfiguration);
   		} catch (Exception e) {
   			return createFailureResponse(connectorId, mediaType,"getConfiguration",xmlconfiguration,e);
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
    @PostMapping(path = "/connector/{connectorId}/setflowconfiguration/{id}", consumes = "application/xml", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> setFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@PathVariable Long id,@RequestBody String xmlConfiguration) throws Exception {

       	try {
			if(xmlConfiguration.isEmpty() || xmlConfiguration.equals("database")){
				flowconfiguration = assimblyDBConfiguration.convertDBToFlowConfiguration(id);
				connector.setFlowConfiguration(flowconfiguration);
			}else {
				flowconfiguration = connector.convertXMLToFlowConfiguration(id.toString(), xmlConfiguration);
				connector.setFlowConfiguration(flowconfiguration);
			} 
			
			return createSuccessResponse(connectorId, mediaType,"setFlowConfiguration","Flow configuration set");
   		} catch (Exception e) {
   			return createFailureResponse(connectorId, mediaType,"setFlowConfiguration","Flow configuration set",e);
   		}
    }    

    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param id (flowId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/connector/{connectorId}/getflowconfiguration/{id}", consumes = "application/xml", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

    	try {
			flowconfiguration = connector.getFlowConfiguration(id.toString());
			xmlconfiguration = connector.convertFlowConfigurationToXML(flowconfiguration);
   			return createSuccessResponse(connectorId, mediaType,"getFlowConfiguration",xmlconfiguration);
   		} catch (Exception e) {
   			return createFailureResponse(connectorId, mediaType,"getFlowConfiguration",xmlconfiguration,e);
   		}
    }    
    
	//manage connector
    /**
     * POST  /start : starts connector.
     * 
     * @param connectorId (by gatewayId)
     * @return The ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the starting connector failed
     * @throws Exception 
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/connector/{connectorId}/start", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> start(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {
       	try {
   			connector.start();
   			return createSuccessResponse(connectorId, mediaType,"start","Connector started");
   		} catch (Exception e) {
   			return createFailureResponse(connectorId, mediaType,"start","Connector started",e);
   		} 
    }
    
    /**
    * POST  /stop : stops connector.
    *
    * @param connectorId (by gatewayId)
    * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the stopping connector failed
    * @throws URISyntaxException if the Location URI syntax is incorrect
    */
   @PostMapping(path = "/connector/{connectorId}/stop", produces = {"text/plain","application/xml","application/json"})
   @Timed
   public ResponseEntity<String> stop(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,  @PathVariable Long connectorId) throws Exception {
       
      	try {
  			connector.stop();
  			return createSuccessResponse(connectorId, mediaType,"start","Connector stopped");
  		} catch (Exception e) {
  			return createFailureResponse(connectorId, mediaType,"start","Connector stopped",e);
  		}
   }

    
   /**
   * GET  /istarted : checks if connector is started.
   *
   * @param connectorId (by GatewaId)
   * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the stopping connector failed
 * @throws Exception 
   */
  @GetMapping(path = "/connector/{connectorId}/isStarted", produces = {"text/plain","application/xml","application/json"})
  @Timed
  public ResponseEntity<String> isStarted(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,  @PathVariable Long connectorId) throws Exception {
 
		try {
			Boolean started = connector.isStarted();
			return createSuccessResponse(connectorId, mediaType,"isStarted",started.toString());
		} catch (Exception e) {
			return createFailureResponse(connectorId, mediaType,"isStarted","Retrieving connector status",e);
		}  
	  
  }
  
	//manage flow
    @GetMapping(path = "/connector/{connectorId}/hasflow/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> hasFlow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
			Boolean hasFlow = connector.hasFlow(id.toString());
			return createSuccessResponse(connectorId, mediaType,"isStarted",hasFlow.toString());
		} catch (Exception e) {
			return createFailureResponse(connectorId, mediaType,"isStarted","Retrieving flows",e);
		}  
 
    }
    
    
    @PostMapping(path = "/connector/{connectorId}/flow/start/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> startflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	initRoute("start",id);
    		connector.startFlow(flowId);
			return createSuccessResponseWithHeaders(connectorId, mediaType,"startFlow","Started flow " + flowId,"Started flow " + flowId,flowId);
		} catch (Exception e) {
			return createFailureResponseWithHeaders(connectorId, mediaType,"startFlow","Started flow " + flowId,"Started flow " + flowId,flowId,e);
		}   	

    }

	@PostMapping(path = "/connector/{connectorId}/flow/stop/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  stopflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	initRoute("stop",id);
    		connector.stopFlow(flowId);
			return createSuccessResponseWithHeaders(connectorId, mediaType,"stopFlow","Stopped flow " + flowId,"Stopped flow " + flowId,flowId);
		} catch (Exception e) {
			return createFailureResponseWithHeaders(connectorId, mediaType,"stopFlow","Started flow " + flowId,"Stopped flow " + flowId,flowId,e);
		}
		
     }

    @PostMapping(path = "/connector/{connectorId}/flow/restart/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  restartflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	initRoute("restart",id);
    		connector.restartFlow(flowId);
			return createSuccessResponseWithHeaders(connectorId, mediaType,"restartFlow","Restart flow " + flowId,"Restart flow " + flowId,flowId);
		} catch (Exception e) {
			return createFailureResponseWithHeaders(connectorId, mediaType,"restartFlow","Restart flow " + flowId,"Restart flow " + flowId,flowId,e);
		}

    }    

    @PostMapping(path = "/connector/{connectorId}/flow/pause/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  pauseflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	initRoute("pause",id);
    		connector.pauseFlow(flowId);
			return createSuccessResponseWithHeaders(connectorId, mediaType,"pauseFlow","Pause flow " + flowId,"Pause flow " + flowId,flowId);
		} catch (Exception e) {
			return createFailureResponseWithHeaders(connectorId, mediaType,"pauseFlow","Pause flow " + flowId,"Pause flow " + flowId,flowId,e);
		}    	
            
     }

    @PostMapping(path = "/connector/{connectorId}/flow/resume/{id}" , produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> resumeflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	initRoute("resume",id);
    		connector.resumeFlow(flowId);
			return createSuccessResponseWithHeaders(connectorId, mediaType,"resumeFlow","Resume flow " + flowId,"Resume flow " + flowId,flowId);
		} catch (Exception e) {
			return createFailureResponseWithHeaders(connectorId, mediaType,"resumeFlow","Resume flow " + flowId,"Resume flow " + flowId,flowId,e);
		}     
     }    
    
    @GetMapping(path = "/connector/{connectorId}/flow/status/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getStatusflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	initRoute("status",id);
    		String status = connector.getFlowStatus(flowId);
			return createSuccessResponseWithHeaders(connectorId, mediaType,"getStatusFlow","Status flow " + flowId,status,flowId);
		} catch (Exception e) {
			return createFailureResponseWithHeaders(connectorId, mediaType,"getStatusFlow","Status flow " + flowId,"Get status flow" + flowId,flowId,e);
		}  
    	
    }

    @GetMapping(path = "/connector/{connectorId}/flow/uptime/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getUptimeflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	initRoute("uptime",id);
    		String uptime = connector.getFlowUptime(flowId);
			return createSuccessResponseWithHeaders(connectorId, mediaType,"getUptimeFlow","Uptime flow " + flowId,uptime,flowId);
		} catch (Exception e) {
			return createFailureResponseWithHeaders(connectorId, mediaType,"getUptimeFlow","Status flow " + flowId,"Get uptime flow " + flowId,flowId,e);
		}
    	
    }    
    
    //private methods    
    private void initRoute(String action, Long id) throws Exception {
    
    	flowId = id.toString();
	
       	if(!connector.isStarted()){
        	try {
				connector.start();
			} catch (Exception e) {
				e.printStackTrace();
			}
        }
	}    

    private ResponseEntity<String> createSuccessResponse(long connectorId, String mediaType, String action, String message) throws Exception{

    	log.debug("REST request with action " + action + " for gateway with id " + connectorId);
    	
    	switch (mediaType.toLowerCase()) {    	
	        case "application/json":
	        	response = ResponseEntity.ok()
	        		.body(BodyUtil.createSuccessJSONResponse(connectorId, action, message));
	            break;
	        case "application/xml":
	        	response = ResponseEntity.ok()
	        		.body(BodyUtil.createSuccessXMLResponse(connectorId, action, message));
	            break;
	        default: 
	        	response = ResponseEntity.ok()
	        		.body(BodyUtil.createSuccessTEXTResponse(message));
	            break;
    	}
    	
   		return response;    	
    }

    private ResponseEntity<String> createSuccessResponseWithHeaders(long connectorId, String mediaType, String action, String message, String headerMessage, String headerParam) throws Exception{

    	log.debug("REST request with action " + action + " for gateway with id " + connectorId);
    	
    	switch (mediaType.toLowerCase()) {    	
	        case "application/json":
	        	response = ResponseEntity.ok().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createSuccessJSONResponse(connectorId, action, message));
	            break;
	        case "application/xml":
	        	response = ResponseEntity.ok().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createSuccessXMLResponse(connectorId, action, message));
	            break;
	        default: 
	        	response = ResponseEntity.ok().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createSuccessTEXTResponse(message));
	            break;
    	}
    	
   		return response;    	
    }    
    
	private ResponseEntity<String> createFailureResponse(long connectorId, String mediaType, String action, String message, Exception e) throws Exception{

		log.error("REST request with action " + action + " for gateway with id " + connectorId + " failed.");
		e.printStackTrace();

    	switch (mediaType.toLowerCase()) {    	
	        case "application/json":
	        	response = ResponseEntity.badRequest()
	        		.body(BodyUtil.createFailureJSONResponse(connectorId, action, message + " failed: " + e.getMessage()));
	            break;
	        case "application/xml":
	        	response = ResponseEntity.badRequest()
	        		.body(BodyUtil.createFailureXMLResponse(connectorId, action, message + " failed: " + e.getMessage()));
	
	            break;
	        default: 
	        	response = ResponseEntity.badRequest()
	        		.body(BodyUtil.createFailureTEXTResponse(message + " failed: " + e.getMessage()));
	            break;
    	}
		
		return response;
	}	

    
	private ResponseEntity<String> createFailureResponseWithHeaders(long connectorId, String mediaType, String action, String message, String headerMessage, String headerParam, Exception e) throws Exception{

		log.error("REST request with action " + action + " for gateway with id " + connectorId + " failed.");
		e.printStackTrace();

    	switch (mediaType.toLowerCase()) {    	
	        case "application/json":
	        	response = ResponseEntity.badRequest().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createFailureJSONResponse(connectorId, action, message + " failed: " + e.getMessage()));
	            break;
	        case "application/xml":
	        	response = ResponseEntity.badRequest().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createFailureXMLResponse(connectorId, action, message + " failed: " + e.getMessage()));
	
	            break;
	        default: 
	        	response = ResponseEntity.badRequest().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createFailureTEXTResponse(message + " failed: " + e.getMessage()));
	            break;
    	}
		
		return response;
	}	
}