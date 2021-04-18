package org.assimbly.gateway.web.rest;

import io.swagger.annotations.ApiParam;
import org.assimbly.connector.Connector;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.NativeWebRequest;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import java.util.TreeMap;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@ControllerAdvice
@RestController
@RequestMapping("/api")
public class FlowManagerResource {

    private final Logger log = LoggerFactory.getLogger(FlowManagerResource.class);

    @Autowired
    private ConnectorResource connectorResource;

    Connector connector;

    private String flowId;
    private String endpointId;

    private boolean plainResponse;

    private String status;

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    //manage flows
    @GetMapping(path = "/connector/{connectorId}/flow/start/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> startflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            status = connector.startFlow(flowId);
            if (status.equals("started")) {
                if (this.messagingTemplate != null) {
                    this.messagingTemplate.convertAndSend("/topic/" + flowId + "/event", "event:started");
                }
                return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType, "/connector/{connectorId}/flow/start/{id}", "started flow " + flowId, "started flow " + flowId, flowId);
            } else {
                throw new Exception(status);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType, "/connector/{connectorId}/flow/start/{id}", e.getMessage(), "unable to start flow " + flowId, flowId);
        }

    }

    @GetMapping(path = "/connector/{connectorId}/flow/stop/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String>  stopflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            status = connector.stopFlow(flowId);
            if(status.equals("stopped")) {
                if(this.messagingTemplate!=null) {
                    this.messagingTemplate.convertAndSend("/topic/" + flowId + "/event","event:stopped");
                }
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
    public ResponseEntity<String>  restartflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            status = connector.restartFlow(flowId);
            if(status.equals("started")) {
                if(this.messagingTemplate!=null) {
                    this.messagingTemplate.convertAndSend("/topic/" + flowId + "/event","event:restarted");
                }
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
    public ResponseEntity<String>  pauseflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            status = connector.pauseFlow(flowId);
            if(status.equals("suspended") || status.equals("stopped")) {
                if(this.messagingTemplate!=null) {
                    this.messagingTemplate.convertAndSend("/topic/" + flowId + "/event","event:suspended");
                }
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
    public ResponseEntity<String> resumeflow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            status = connector.resumeFlow(flowId);
            if(status.equals("started")) {
                if(this.messagingTemplate!=null) {
                    this.messagingTemplate.convertAndSend("/topic/" + flowId + "/event","event:resumed");
                }
                return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/resume/{id}","resumed","resumed flow " + flowId,flowId);
            }else {
                throw new Exception(status);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/resume/{id}",e.getMessage(),"unable to resume flow " + flowId,flowId);
        }
    }


    @GetMapping(path = "/connector/{connectorId}/flow/isstarted/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> isFlowStarted(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            boolean started = connector.isFlowStarted(flowId);
            String isStarted = Boolean.toString(started);
            return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/status/{id}",isStarted,isStarted,flowId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/status/{id}",e.getMessage(),"unable to get status for flow " + flowId,flowId);
        }

    }


    @GetMapping(path = "/connector/{connectorId}/flow/status/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowStatus(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            status = connector.getFlowStatus(flowId);
            return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/status/{id}",status,status,flowId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/status/{id}",e.getMessage(),"unable to get status for flow " + flowId,flowId);
        }

    }

    @GetMapping(path = "/connector/{connectorId}/flow/uptime/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowUptime(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            String uptime = connector.getFlowUptime(flowId);
            return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/uptime/{id}",uptime,uptime,flowId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/uptime/{id}",e.getMessage(),"unable to get uptime flow " + flowId,flowId);
        }

    }

  @GetMapping(path = "/connector/{connectorId}/hasflow/{id}", produces = {"text/plain","application/xml","application/json"})
  public ResponseEntity<String> hasFlow(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
            connector = connectorResource.getConnector();
            Boolean hasFlow = connector.hasFlow(id.toString());
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/hasflow/{id}",hasFlow.toString());
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/hasflow/{id}",e.getMessage());
		}

   }


    @GetMapping(path = "/connector/{connectorId}/flow/stats/{id}/{endpointid}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowStats(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id, @PathVariable Long endpointid) throws Exception {

        plainResponse = true;

        try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
            endpointId = endpointid.toString();

            String flowStats = connector.getFlowStats(flowId, endpointId, mediaType);
            if(flowStats.startsWith("Error")||flowStats.startsWith("Warning")) {plainResponse = false;}
            return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/flow/stats/{id}",flowStats,plainResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/stats/{id}",e.getMessage());
        }
    }

    @GetMapping(path = "/connector/{connectorId}/flow/lasterror/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowLastError(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
    		String lastError = connector.getFlowLastError(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/lasterror/{id}",lastError,lastError,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/lasterror/{id}",e.getMessage(),"unable to get last error for flow " + flowId,flowId);
		}
    }

    @GetMapping(path = "/connector/{connectorId}/flow/totalmessages/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowTotalMessages(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
    		String numberOfMessages = connector.getFlowTotalMessages(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/totalmessages/{id}",numberOfMessages,numberOfMessages,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/totalmessages/{id}",e.getMessage(),"unable to get total messages of flow " + flowId,flowId);
		}
    }

    @GetMapping(path = "/connector/{connectorId}/flow/completedmessages/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowCompletedMessages(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
    		String completedMessages = connector.getFlowCompletedMessages(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/completedmessages/{id}",completedMessages,completedMessages,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/completedmessages/{id}",e.getMessage(),"unable to get completed messages of flow " + flowId,flowId);
		}
    }

    @GetMapping(path = "/connector/{connectorId}/flow/failedmessages/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowFailedMessages(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
            connectorResource.init();
            connector = connectorResource.getConnector();

            flowId = id.toString();
    		String failedMessages = connector.getFlowFailedMessages(flowId);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/failedmessages/{id}",failedMessages,failedMessages,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/failedmessages/{id}",e.getMessage(),"unable to get failed messages of flow " + flowId,flowId);
		}
    }

    @GetMapping(path = "/connector/{connectorId}/flow/alerts/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowAlertsLog(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	flowId = id.toString();
            connector = connectorResource.getConnector();

            String log = connector.getFlowAlertsLog(flowId,100);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/failedlog/{id}",log,log,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/failedmessages/{id}",e.getMessage(),"unable to get failed log of flow" + flowId,flowId);
		}
    }

    @GetMapping(path = "/connector/{connectorId}/flow/numberofalerts/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowNumberOfAlerts(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	flowId = id.toString();

        	connector = connectorResource.getConnector();
            String numberOfEntries = connector.getFlowAlertsCount(flowId);

            return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/failedlogentries/{id}",numberOfEntries,numberOfEntries,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/failedlogentries/{id}",e.getMessage(),"unable to get failed entries of flow log" + flowId,flowId);
		}
    }

    @GetMapping(path = "/connector/{connectorId}/numberofalerts", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getConnectorNumberOfAlerts(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

		try {
            connector = connectorResource.getConnector();
            TreeMap<String,String> numberOfEntriesList = connector.getConnectorAlertsCount();

			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/flow/failedlog/{id}",numberOfEntriesList.toString());
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/flow/failedmessages/{id}",e.getMessage());
		}
    }

    @GetMapping(path = "/connector/{connectorId}/flow/eventlog/{id}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getFlowEventLog(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long id) throws Exception {

		try {
        	flowId = id.toString();

            connector = connectorResource.getConnector();
            String log = connector.getFlowEventsLog(flowId,100);
			return ResponseUtil.createSuccessResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/eventlog/{id}",log,log,flowId);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponseWithHeaders(connectorId, mediaType,"/connector/{connectorId}/flow/eventlog/{id}",e.getMessage(),"unable to get event log of flow " + flowId,flowId);
		}
    }

    @PostMapping(path = "/connector/{connectorId}/maintenance/{time}", consumes = {"application/json"}, produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> setMaintenance(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable Long time, @RequestBody List<Long> ids) throws Exception {

        try {

            //pass spring variable into new Thread (outside of Spring context)
            final SimpMessageSendingOperations messagingTemplate2 = messagingTemplate;

            connector = connectorResource.getConnector();

            Thread thread = new Thread(new Runnable()
            {

                SimpMessageSendingOperations messagingTemplate = messagingTemplate2;

                public void run()
                {

                    try {
                        for(Long id : ids) {
                            flowId = id.toString();
                            status = connector.getFlowStatus(flowId);
                            if(status.equals("started")) {
                                status = connector.pauseFlow(flowId);
                                if(status.equals("suspended") || status.equals("stopped")) {
                                    if(this.messagingTemplate!=null) {
                                        this.messagingTemplate.convertAndSend("/topic/" + flowId + "/event","event:suspended");
                                    }
                                }else {
                                    throw new Exception(status);
                                }
                            }
                        }

                        Thread.sleep(time);

                        for(Long id : ids) {

                            flowId = id.toString();
                            status = connector.getFlowStatus(flowId);
                            if(status.equals("suspended")) {
                                status = connector.startFlow(flowId);
                                if(status.equals("started")) {
                                    if(this.messagingTemplate!=null) {
                                        this.messagingTemplate.convertAndSend("/topic/" + flowId + "/event","event:resumed");
                                    }
                                }
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

    // Generates a generic error response (exceptions outside try catch):
    @ExceptionHandler({Exception.class})
    public ResponseEntity<String> connectorErrorHandler(Exception error, NativeWebRequest request) throws Exception {

    	Long connectorId = 0L; // set connectorid to 0, as we may get a string value
    	String mediaType = request.getNativeRequest(HttpServletRequest.class).getHeader("ACCEPT");
    	String path = request.getNativeRequest(HttpServletRequest.class).getRequestURI();
    	String message = error.getMessage();

    	return ResponseUtil.createFailureResponse(connectorId, mediaType,path,message);
    }

}
