package org.assimbly.gateway.web.rest;

import io.swagger.annotations.ApiParam;

import org.assimbly.connector.Connector;
import org.assimbly.connector.impl.CamelConnector;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.NativeWebRequest;

import com.codahale.metrics.annotation.Timed;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@ControllerAdvice
@RestController
@RequestMapping("/api")
public class ConnectorResource {

	private Connector connector = new CamelConnector();

	private String flowId;


	private boolean plainResponse;

	private String gatewayConfiguration;
	private String flowConfiguration;

	private String status;

	private String type;
	
    public ConnectorResource() {}
    
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
    public ResponseEntity<String> setConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@RequestBody String configuration) throws Exception {
    	
       	try {
       		connector.setConfiguration(connectorId.toString(), mediaType, configuration);
   			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/setconfiguration","Connector configuration set");
   		} catch (Exception e) {
   			e.printStackTrace();
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/setconfiguration",e.getMessage());
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
			gatewayConfiguration = connector.getConfiguration(connectorId.toString(),mediaType);
			if(gatewayConfiguration.startsWith("Error")||gatewayConfiguration.startsWith("Warning")) {
				return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/getconfiguration",gatewayConfiguration);
			}
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/getconfiguration",gatewayConfiguration,plainResponse);				
   		} catch (Exception e) {
   			e.printStackTrace();
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/getconfiguration",e.getMessage());
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
       		connector.setFlowConfiguration(id.toString(), mediaType, configuration);
       		return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/setflowconfiguration/{id}","Flow configuration set");			
   		} catch (Exception e) {
   			e.printStackTrace();
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/setflowconfiguration/{id}",e.getMessage());
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
			flowConfiguration = connector.getFlowConfiguration(id.toString(),mediaType);
			if(flowConfiguration.startsWith("Error")||flowConfiguration.startsWith("Warning")) {
				return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/getconfiguration",flowConfiguration);
			}
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/setflowconfiguration/{id}",flowConfiguration,plainResponse);				
   		} catch (Exception e) {
   			e.printStackTrace();
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/setflowconfiguration/{id}",e.getMessage());
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
       		
       		if(connector.isStarted()) {
       			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/start","Connector already running");	
       		}else {
       			connector.start();
       			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/start","Connector started");
       		}	
   			
   		} catch (Exception e) {
   			e.printStackTrace();
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/start",e.getMessage());
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
      		String config = connector.getConfiguration(connectorId.toString(), mediaType);
      		System.out.println("config=" + config);
  			connector.stop();
  			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/stop","Connector stopped");
  		} catch (Exception e) {
   			e.printStackTrace();
  			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/stop",e.getMessage());
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
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/isStarted",started.toString());
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/isStarted",e.getMessage());
		}  
	  
  }

  @PostMapping(path = "/connector/{connectorId}/maintenance/{time}", consumes = {"application/json"}, produces = {"text/plain","application/xml","application/json"})
  @Timed
  public ResponseEntity<String> setMaintenance(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long time, @RequestBody List<Long> ids) throws Exception {

		try {

			Thread thread = new Thread(new Runnable()
			{
			   public void run()
			   {					
					try {
						for(Long id : ids) {
							flowId = id.toString();
							status = connector.getFlowStatus(flowId);
							if(status.equals("started")) {
								connector.pauseFlow(flowId);
							}
						}
			        	
						Thread.sleep(time);
						
						for(Long id : ids) {

							flowId = id.toString();
							status = connector.getFlowStatus(flowId);
							if(status.equals("suspended")) {
								connector.resumeFlow(flowId);
							}
						}

					} catch (Exception e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
			   }
			});

			// start the thread
			thread.start();
			
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/maintenance/{time}","Set flows into maintenance mode for " + time + " miliseconds");
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/maintenance/{time}",e.getMessage());
		}
  }
  
  @GetMapping(path = "/connector/{connectorId}/stats", produces = {"text/plain","application/xml","application/json"})
  @Timed
  public ResponseEntity<String> getStats(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Optional<String> statsType) throws Exception {

	  plainResponse = true;

		try {
	      	init();
	      	if(statsType.isPresent()){
	      		type=statsType.get();
	      	}else {
	      		type="default";
	      	}
	  		String stats = connector.getStats(type, mediaType);
	  		if(stats.startsWith("Error")||stats.startsWith("Warning")) {plainResponse = false;}
				return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/stats",stats,plainResponse);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/stats",e.getMessage());
		}
  }


  @GetMapping(path = "/connector/{connectorId}/lasterror", produces = {"text/plain","application/xml","application/json"})
  @Timed
  public ResponseEntity<String> getLastError(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

		try {
			String error = connector.getLastError();
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/lasterror",error,plainResponse);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/lasterror",e.getMessage());
		}

  }
  
	//manage flow
    @GetMapping(path = "/connector/{connectorId}/hasflow/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> hasFlow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
			Boolean hasFlow = connector.hasFlow(id.toString());
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/hasflow/{id}",hasFlow.toString());
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/hasflow/{id}",e.getMessage());
		}  
 
    }

    @GetMapping(path = "/connector/{connectorId}/removeflow/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> removeFlow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
			Boolean removedFlow = connector.removeFlow(id.toString());
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/removeflow/{id}",removedFlow.toString());
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/removeflow/{id}",e.getMessage());
		}  
 
    }    
    
    @GetMapping(path = "/connector/{connectorId}/flow/start/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> startflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		status = connector.startFlow(flowId);
    		if(status.equals("started")) {
    			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/start/{id}","started flow " + flowId,"started flow " + flowId,flowId);
    		}else {
    			throw new Exception(status);
    		}			
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/start/{id}",e.getMessage(),"unable to start flow " + flowId,flowId);
		}   	

    }

	@GetMapping(path = "/connector/{connectorId}/flow/stop/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  stopflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		status = connector.stopFlow(flowId);
    		if(status.equals("stopped")) {
    			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/stop/{id}","stopped flow " + flowId,"stopped flow " + flowId,flowId);
    		}else {
    			throw new Exception(status);
    		}			
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/stop/{id}",e.getMessage(),"unable to stop flow " + flowId,flowId);
		}
				
     }

    @GetMapping(path = "/connector/{connectorId}/flow/restart/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  restartflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		status = connector.restartFlow(flowId);
    		if(status.equals("started")) {
    			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/restart/{id}","restarted","restarted flow " + flowId,flowId);
    		}else {
    			throw new Exception(status);
    		}			
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/restart/{id}",e.getMessage(),"unable to restart flow " + flowId,flowId);
		}

    }    

    @GetMapping(path = "/connector/{connectorId}/flow/pause/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String>  pauseflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		status = connector.pauseFlow(flowId);
    		if(status.equals("suspended") || status.equals("stopped")) {
    			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/pause/{id}","paused","paused flow " + flowId,flowId);
    		}else {
    			throw new Exception(status);
    		}			
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/pause/{id}",e.getMessage(),"unable to pause flow " + flowId,flowId);
		}    	
            
     }

    @GetMapping(path = "/connector/{connectorId}/flow/resume/{id}" , produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> resumeflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

    	try {
        	init();
        	flowId = id.toString();
    		status = connector.resumeFlow(flowId);
    		if(status.equals("started")) {
    			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/resume/{id}","resumed","resumed flow " + flowId,flowId);
    		}else {
    			throw new Exception(status);
    		}			
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/resume/{id}",e.getMessage(),"unable to resume flow " + flowId,flowId);
		}     
     }    
    
    @GetMapping(path = "/connector/{connectorId}/flow/status/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowStatus(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		status = connector.getFlowStatus(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/status/{id}",status,status,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/status/{id}",e.getMessage(),"unable to get status for flow " + flowId,flowId);
		}  
    	
    }

    @GetMapping(path = "/connector/{connectorId}/flow/uptime/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowUptime(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		String uptime = connector.getFlowUptime(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/uptime/{id}",uptime,uptime,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/uptime/{id}",e.getMessage(),"unable to get uptime flow " + flowId,flowId);
		}
    	
    }    

    
    @GetMapping(path = "/connector/{connectorId}/flow/lasterror/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowLastError(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		String lastError = connector.getFlowLastError(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/lasterror/{id}",lastError,lastError,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/lasterror/{id}",e.getMessage(),"unable to get last error for flow " + flowId,flowId);
		}
    }
    
    @GetMapping(path = "/connector/{connectorId}/flow/totalmessages/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowTotalMessages(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		String numberOfMessages = connector.getFlowTotalMessages(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/totalmessages/{id}",numberOfMessages,numberOfMessages,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/totalmessages/{id}",e.getMessage(),"unable to get total messages of flow " + flowId,flowId);
		}
    }

    @GetMapping(path = "/connector/{connectorId}/flow/completedmessages/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowCompletedMessages(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		String completedMessages = connector.getFlowCompletedMessages(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/completedmessages/{id}",completedMessages,completedMessages,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/completedmessages/{id}",e.getMessage(),"unable to get completed messages of flow " + flowId,flowId);
		}
    }
    
    @GetMapping(path = "/connector/{connectorId}/flow/failedmessages/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowFailedMessages(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	init();
        	flowId = id.toString();
    		String failedMessages = connector.getFlowFailedMessages(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/failedmessages/{id}",failedMessages,failedMessages,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/failedmessages/{id}",e.getMessage(),"unable to get failed messages of flow " + flowId,flowId);
		}
    }

    
    @GetMapping(path = "/connector/{connectorId}/flow/documenation/version", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getDocumentationVersion(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

		try {
    		String documentation = connector.getDocumentationVersion();
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/flow/documenation/version",documentation,plainResponse);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/documenation/version",e.getMessage());
		}
    }
	
    @GetMapping(path = "/connector/{connectorId}/flow/documenation/{componenttype}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getDocumentation(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable String componenttype) throws Exception {

    	plainResponse = true;

		try {
    		String documentation = connector.getDocumentation(componenttype, mediaType);
    		if(documentation.startsWith("Unknown")) {
				return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/documenation/{componenttype}",documentation);
			}
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/flow/documenation/{componenttype}",documentation,plainResponse);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/documenation/{componenttype}",e.getMessage());
		}
    }

    @GetMapping(path = "/connector/{connectorId}/flow/schema/{componenttype}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getComponentSchema(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable String componenttype) throws Exception {

    	plainResponse = true;

		try {
    		String documentation = connector.getComponentSchema(componenttype, mediaType);
    		if(documentation.startsWith("Unknown")) {
				return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/schema/{componenttype}",documentation);
			}
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/flow/schema/{componenttype}",documentation,plainResponse);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/schema/{componenttype}",e.getMessage());
		}
    }

	@GetMapping(path = "/connector/{connectorId}/flow/validateUri", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> validateFlowUri(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @RequestHeader("Uri") String uri, @PathVariable Long connectorId) throws Exception {
		try {
    		String flowValidation = connector.validateFlow(uri);
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/flow/validateUri",flowValidation);
		} catch (Exception e) {
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/validateUri",e.getMessage());
		}
    }
    
    @GetMapping(path = "/connector/{connectorId}/flow/stats/{id}", produces = {"text/plain","application/xml","application/json"})
    @Timed
    public ResponseEntity<String> getFlowStats(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

    	plainResponse = true;

		try {
        	init();
        	flowId = id.toString();
    		String flowStats = connector.getFlowStats(flowId, mediaType);
    		if(flowStats.startsWith("Error")||flowStats.startsWith("Warning")) {plainResponse = false;}
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/flow/stats/{id}",flowStats,plainResponse);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/stats/{id}",e.getMessage());
		}
    }
    
    // Generates a generic error response (exceptions outside try catch):
    @ExceptionHandler({Exception.class})
    public ResponseEntity<String> connectorErrorHandler(Exception error, NativeWebRequest request) throws Exception {
    	
    	Long connectorId = 0L; // set connectorid to 0, as we may get a string value
    	String mediaType = request.getNativeRequest(HttpServletRequest.class).getHeader("ACCEPT");
    	String path = request.getNativeRequest(HttpServletRequest.class).getRequestURI();
    	String message = error.getMessage();

    	return ResponseUtil.createFailureResponse(connectorId, mediaType,path,message);
    }
    
    //private methods    
    
    private void init() throws Exception {
    
       	if(!connector.isStarted()){
        	try {
				connector.start();
			} catch (Exception e) {
				e.printStackTrace();
			}
        }
	}

    /*
    //This method is called on application startup
    @PostConstruct
    private void initConnector() throws Exception {
    
    	//start connector
       	if(!connector.isStarted()){
        	try {
				connector.start();
			} catch (Exception e) {
				e.printStackTrace();
			}
        }

		//start flows with autostart
       	List<Flow> flows = flowRepository.findAll();
		
		for(Flow flow : flows) {
       		if(flow.isAutoStart()) {
       			String configuration = assimblyDBConfiguration.convertDBToFlowConfiguration(flow.getId(),"xml/application");
       			connector.setFlowConfiguration(flow.getId().toString(),"application/xml", configuration);
				connector.startFlow(flow.getId().toString());
       		}
       	}
	}*/
}