package org.assimbly.gateway.web.rest;

import io.github.jhipster.config.JHipsterProperties;
import io.swagger.annotations.ApiParam;

import org.assimbly.connector.Connector;
import org.assimbly.connector.impl.CamelConnector;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.codahale.metrics.annotation.Timed;

import java.net.URISyntaxException;
import java.util.List;
import java.util.TreeMap;

import javax.annotation.PostConstruct;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@RestController
@RequestMapping("/api")
public class ConnectorResource {

    private final Environment env;

    private final JHipsterProperties jHipsterProperties;

	private Connector connector = new CamelConnector();

	private String flowId;


	private List<TreeMap<String,String>> gatewayProperties;
	private TreeMap<String, String> flowProperties;

	private boolean plainResponse;

	private String gatewayConfiguration;
	private String flowConfiguration;

    public ConnectorResource(Environment env, JHipsterProperties jHipsterProperties) {
        this.env = env;
        this.jHipsterProperties = jHipsterProperties;
    }
    
    //configure connector (by gatewayid)
    
    /**
     * POST  /connector/{connectorid}/setconfiguration : Set configuration from XML.
     *
     * @param connectorId (gatewayId)
     * @param configuration as xml
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/connector/{connectorId}/setconfiguration", consumes =  {"text/plain","application/xml","application/json"}, produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> setConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@RequestBody String xmlConfiguration) throws Exception {
    	
       	try {
			if(mediaType.equals("application/xml")) {
	       		gatewayProperties = connector.convertXMLToConfiguration(connectorId.toString(), xmlConfiguration);
				connector.setConfiguration(gatewayProperties);
	   			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setConfiguration","Connector configuration set");
			}else if(mediaType.equals("application/json")){
				gatewayProperties = connector.convertJSONToConfiguration(connectorId.toString(), xmlConfiguration);
				connector.setConfiguration(gatewayProperties);
	   			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setConfiguration","Connector configuration set");
			}else {
				//return json until ini is supported
				gatewayProperties = connector.convertJSONToConfiguration(connectorId.toString(), xmlConfiguration);
				connector.setConfiguration(gatewayProperties);
	   			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setConfiguration","Connector configuration set");
			}
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"setConfiguration","Connector configuration set",e);
   		}
    	
    }    
    
    /**
     * Get  /connector/{connectorId}/getconfiguration : get XML configuration for gateway.
     *
     * @param connectorid (gatewayId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/connector/{connectorId}/getconfiguration", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

    	plainResponse = true;
    	
    	try {
    		gatewayProperties = connector.getConfiguration();
			
			if(mediaType.equals("application/xml")) {
				gatewayConfiguration = connector.convertConfigurationToXML(connectorId.toString(), gatewayProperties);
				if(gatewayConfiguration.startsWith("Error")||gatewayConfiguration.startsWith("Warning")) {plainResponse = false;}
			}else if(mediaType.equals("application/json")){
				gatewayConfiguration = connector.convertConfigurationToJSON(connectorId.toString(), gatewayProperties);
				if(gatewayConfiguration.startsWith("Error")||gatewayConfiguration.startsWith("Warning")) {plainResponse = false;}
			}else {
				//return json until ini is supported
				gatewayConfiguration = connector.convertConfigurationToJSON(connectorId.toString(), gatewayProperties);
				if(gatewayConfiguration.startsWith("Error")||gatewayConfiguration.startsWith("Warning")) {plainResponse = false;}
			}
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"getConfiguration",gatewayConfiguration,plainResponse);				
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"getConfiguration",gatewayConfiguration,e);
   		}

    }    

    /**
     * POST  /connector/{connectorId}/setflowconfiguration/{id} : Set configuration from XML.
     *
     * @param connectorid (gatewayId)
     * @param id (FlowId)
     * @param configuration as XML / if empty get from db (for the time being)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/connector/{connectorId}/setflowconfiguration/{id}", consumes =  {"text/plain","application/xml","application/json"}, produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> setFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@PathVariable Long id,@RequestBody String configuration) throws Exception {
  	
       	try {
			if(mediaType.equals("application/xml")) {
	       		flowProperties = connector.convertXMLToFlowConfiguration(id.toString(), configuration);
				connector.setFlowConfiguration(flowProperties);
			}else if(mediaType.equals("application/json")){
				flowProperties = connector.convertJSONToFlowConfiguration(id.toString(), configuration);
				connector.setFlowConfiguration(flowProperties);
			}else {
				//return json until ini is supported
				flowProperties = connector.convertJSONToFlowConfiguration(id.toString(), configuration);
				connector.setFlowConfiguration(flowProperties);
			}
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"setFlowConfiguration","Flow configuration set");
			
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"setFlowConfiguration","Flow configuration set",e);
   		}
    }    

    /**
     * Get  /connector/{connectorId}/getflowconfiguration/{id} : get XML configuration for gateway.
     *
     * @param connectorid (gatewayId)
     * @param id (flowId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/connector/{connectorId}/getflowconfiguration/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

    	plainResponse = true;
    	
    	try {
    		flowProperties = connector.getFlowConfiguration(id.toString());
			
			if(mediaType.equals("application/xml")) {
				flowConfiguration = connector.convertFlowConfigurationToXML(flowProperties);
				if(flowConfiguration.startsWith("Error")||flowConfiguration.startsWith("Warning")) {plainResponse = false;}
			}else if(mediaType.equals("application/json")){
				flowConfiguration = connector.convertFlowConfigurationToJSON(flowProperties);
				if(flowConfiguration.startsWith("Error")||flowConfiguration.startsWith("Warning")) {plainResponse = false;}
			}else {
				//return json until ini is supported
				flowConfiguration = connector.convertFlowConfigurationToJSON(flowProperties);
				if(flowConfiguration.startsWith("Error")||flowConfiguration.startsWith("Warning")) {plainResponse = false;}
			}
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"getFlowConfiguration",flowConfiguration,plainResponse);				
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"getFlowConfiguration",flowConfiguration,e);
   		}
    }    

    
	//manage connector
    /**
     * Get  /start : starts connector.
     * 
     * @param connectorId (by gatewayId)
     * @return The ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the starting connector failed
     * @throws Exception 
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/connector/{connectorId}/start", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> start(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {
       	try {
   			connector.start();
   			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"start","Connector started");
   		} catch (Exception e) {
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"start","Connector started",e);
   		} 
    }
    
    /**
    * GET  /stop : stops connector.
    *
    * @param connectorId (by gatewayId)
    * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the stopping connector failed
    * @throws URISyntaxException if the Location URI syntax is incorrect
    */
   @GetMapping(path = "/connector/{connectorId}/stop", produces = {"text/plain","application/xml","application/json"})
   @Timed
   public ResponseEntity<String> stop(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,  @PathVariable Long connectorId) throws Exception {
       
      	try {
  			connector.stop();
  			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"stop","Connector stopped");
  		} catch (Exception e) {
  			return ResponseUtil.createFailureResponse(connectorId, mediaType,"stop","Connector stopped",e);
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
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"isStarted",started.toString());
		} catch (Exception e) {
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"isStarted","Retrieving connector status",e);
		}  
	  
  }
  
	//manage flow
    @GetMapping(path = "/connector/{connectorId}/hasflow/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> hasFlow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
			Boolean hasFlow = connector.hasFlow(id.toString());
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"isStarted",hasFlow.toString());
		} catch (Exception e) {
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"isStarted","Retrieving flows",e);
		}  
 
    }

    @GetMapping(path = "/connector/{connectorId}/removeflow/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> removeFlow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
			Boolean removedFlow = connector.removeFlow(id.toString());
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"isStarted",removedFlow.toString());
		} catch (Exception e) {
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"isStarted","Retrieving flows",e);
		}  
 
    }    
    
    @GetMapping(path = "/connector/{connectorId}/flow/start/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> startflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		connector.startFlow(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"startFlow","Started flow " + flowId,"Started flow " + flowId,flowId);
		} catch (Exception e) {
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"startFlow","Started flow " + flowId,"Started flow " + flowId,flowId,e);
		}   	

    }

	@GetMapping(path = "/connector/{connectorId}/flow/stop/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  stopflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		connector.stopFlow(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"stopFlow","Stopped flow " + flowId,"Stopped flow " + flowId,flowId);
		} catch (Exception e) {
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"stopFlow","Started flow " + flowId,"Stopped flow " + flowId,flowId,e);
		}
		
     }

    @GetMapping(path = "/connector/{connectorId}/flow/restart/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  restartflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		connector.restartFlow(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"restartFlow","Restart flow " + flowId,"Restart flow " + flowId,flowId);
		} catch (Exception e) {
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"restartFlow","Restart flow " + flowId,"Restart flow " + flowId,flowId,e);
		}

    }    

    @GetMapping(path = "/connector/{connectorId}/flow/pause/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  pauseflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		connector.pauseFlow(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"pauseFlow","Pause flow " + flowId,"Pause flow " + flowId,flowId);
		} catch (Exception e) {
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"pauseFlow","Pause flow " + flowId,"Pause flow " + flowId,flowId,e);
		}    	
            
     }

    @GetMapping(path = "/connector/{connectorId}/flow/resume/{id}" , produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> resumeflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		connector.resumeFlow(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"resumeFlow","Resume flow " + flowId,"Resume flow " + flowId,flowId);
		} catch (Exception e) {
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"resumeFlow","Resume flow " + flowId,"Resume flow " + flowId,flowId,e);
		}     
     }    
    
    @GetMapping(path = "/connector/{connectorId}/flow/status/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getStatusflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		String status = connector.getFlowStatus(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"getStatusFlow","Status flow " + flowId,status,flowId);
		} catch (Exception e) {
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"getStatusFlow","Status flow " + flowId,"Get status flow" + flowId,flowId,e);
		}  
    	
    }

    @GetMapping(path = "/connector/{connectorId}/flow/uptime/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getUptimeflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		String uptime = connector.getFlowUptime(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"getUptimeFlow","Uptime flow " + flowId,uptime,flowId);
		} catch (Exception e) {
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"getUptimeFlow","Status flow " + flowId,"Get uptime flow " + flowId,flowId,e);
		}
    	
    }    
    
    //private methods    
    
    //This method is called on application startup and on flow calls
    @PostConstruct
    private void init() throws Exception {
    
       	if(!connector.isStarted()){
        	try {
				connector.start();
			} catch (Exception e) {
				e.printStackTrace();
			}
        }
	}
}