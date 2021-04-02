package org.assimbly.gateway.web.rest;

import io.swagger.annotations.ApiParam;
import org.assimbly.connector.Connector;
import org.assimbly.connector.impl.CamelConnector;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.ApplicationProperties.Gateway;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.config.environment.DBConfiguration;
import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.event.FailureListener;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.NativeWebRequest;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;


/**
 * Resource to return information about the currently running Spring profiles.
 */
@ControllerAdvice
@RestController
@RequestMapping("/api")
public class ConnectorResource {

    private final Logger log = LoggerFactory.getLogger(ConnectorResource.class);

    private final ApplicationProperties applicationProperties;

    private Connector connector = new CamelConnector();

    private boolean plainResponse;

    private String gatewayConfiguration;

    private boolean connectorIsStarting = false;

    private String type;

    @Autowired
    EncryptionProperties encryptionProperties;

    @Autowired
    FailureListener failureListener;

    @Autowired
    FlowRepository flowRepository;

    @Autowired
    DBConfiguration assimblyDBConfiguration;

    public ConnectorResource(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
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
    public ResponseEntity<String> setConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@RequestBody String configuration) throws Exception {
        try {
            connector.setConfiguration(connectorId.toString(), mediaType, configuration);
            return ResponseUtil.createSuccessResponse(connectorId, mediaType, "/connector/{connectorId}/setconfiguration", "Connector configuration set");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(connectorId, mediaType, "/connector/{connectorId}/setconfiguration", e.getMessage());
        }

    }

    /**
     * Get  /connector/{connectorId}/getconfiguration : get XML configuration for gateway.
     *
     * @param connectorId (gatewayId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/connector/{connectorId}/getconfiguration", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getConfiguration(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

        plainResponse = true;

        try {
            gatewayConfiguration = connector.getConfiguration(connectorId.toString(), mediaType);
            if (gatewayConfiguration.startsWith("Error") || gatewayConfiguration.startsWith("Warning")) {
                return ResponseUtil.createFailureResponse(connectorId, mediaType, "/connector/{connectorId}/getconfiguration", gatewayConfiguration);
            }
            return ResponseUtil.createSuccessResponse(connectorId, mediaType, "/connector/{connectorId}/getconfiguration", gatewayConfiguration, plainResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(connectorId, mediaType, "/connector/{connectorId}/getconfiguration", e.getMessage());
        }

    }

    /**
     * Get  /start : starts connector.
     *
     * @param connectorId (by gatewayId)
     * @return The ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the starting connector failed
     * @throws Exception
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(path = "/connector/{connectorId}/start", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> start(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {
        try {

            if (connector.isStarted()) {
                return ResponseUtil.createFailureResponse(connectorId, mediaType, "/connector/{connectorId}/start", "Connector already running");
            } else {
                connector.addEventNotifier(failureListener);
                connector.setTracing(false);
                connector.start();
                return ResponseUtil.createSuccessResponse(connectorId, mediaType, "/connector/{connectorId}/start", "Connector started");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(connectorId, mediaType, "/connector/{connectorId}/start", e.getMessage());
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
    public ResponseEntity<String> stop(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,  @PathVariable Long connectorId) throws Exception {

        try {
            String config = connector.getConfiguration(connectorId.toString(), mediaType);
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
    public ResponseEntity<String> isStarted(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,  @PathVariable Long connectorId) throws Exception {

        try {
            Boolean started = connector.isStarted();
            return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/isStarted",started.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/isStarted",e.getMessage());
        }

    }

    @GetMapping(path = "/connector/{connectorId}/testconnection/{host}/{port}/{timeout}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> testConnection(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId, @PathVariable String host,@PathVariable int port, @PathVariable int timeout) throws Exception {

		try {
    		String testConnectionResult = connector.testConnection(host, port, timeout);
			return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/testconnection/{host}/{port}/{timeout}",testConnectionResult);
		} catch (Exception e) {
   			e.printStackTrace();
			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/testconnection/{host}/{port}/{timeout}",e.getMessage());
		}

    }

    @GetMapping(path = "/connector/{connectorId}/lasterror", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> getLastError(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId) throws Exception {

        try {
            String error = connector.getLastError();
            return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/lasterror",error,plainResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/lasterror",e.getMessage());
        }

    }

    /**
     * POST  /connector/{connectorId}/resolvedependencybyscheme/{scheme} : Resolve the Mave dependency by URI scheme (for example SFTP or FILE).
     *
     * @param connectorId (gatewayId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/connector/{connectorId}/resolvedependencybyscheme/{scheme}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> resolveDepedencyByScheme(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@PathVariable String scheme) throws Exception {

       	try {
       		String result = connector.resolveDependency(scheme);
       		return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/resolvedependency/{groupId}/{artifactId}/{version}",result);
   		} catch (Exception e) {
   			e.printStackTrace();
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/resolvedependency/{groupId}/{artifactId}/{version}",e.getMessage());
   		}
    }


    /**
     * POST  /connector/{connectorId}/resolvedependency/{groupId}/{artifactId}/{version}
     *
     * @param connectorId (gatewayId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/connector/{connectorId}/resolvedependency/{groupId}/{artifactId}/{version}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> resolveDepedency(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@PathVariable String groupId,@PathVariable String artifactId,@PathVariable String version) throws Exception {
       	try {
       		String result = connector.resolveDependency(groupId, artifactId, version);
       		return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/resolvedependency/{groupId}/{artifactId}/{version}",result);
   		} catch (Exception e) {
   			e.printStackTrace();
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/resolvedependency/{groupId}/{artifactId}/{version}",e.getMessage());
   		}
    }

    /**
     * POST  /connector/{connectorId}/setcertificates : Sets TLS certificates.
     *
     * @param connectorId (gatewayId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/connector/{connectorId}/setcertificates", consumes =  {"text/plain","application/xml","application/json"}, produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> setCertificates(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long connectorId,@RequestBody String url) throws Exception {

       	try {
       		connector.setCertificatesInTruststore(url);
       		return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/setcertificates/{id}","Connector certificates set");
   		} catch (Exception e) {
   			e.printStackTrace();
   			return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/setcertificates/{id}",e.getMessage());
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

    public Connector getConnector() {
		return connector;
    }


     public void init() throws Exception {

       	if(!connector.isStarted() && !connectorIsStarting){
        	try {

                Gateway gateway = applicationProperties.getGateway();

                String applicationBaseDirectory = gateway.getBaseDirectory();
                boolean applicationTracing = gateway.getTracing();
                boolean applicationDebugging = gateway.getDebugging();

                if (!applicationBaseDirectory.equals("default")) {
                    connector.setBaseDirectory(applicationBaseDirectory);
                }

                connectorIsStarting = true;
                connector.setEncryptionProperties(encryptionProperties.getProperties());
                connector.addEventNotifier(failureListener);
                connector.setTracing(applicationTracing);
                connector.setDebugging(applicationDebugging);

                connector.start();

                int count = 1;

                while (!connector.isStarted() && count < 300) {
                    Thread.sleep(100);
                    count++;
                }

                connectorIsStarting = false;

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
	}

    //private methods

    //This method can be called on application startup
    @PostConstruct
    private void initConnector() {

    	try {
			init();
		} catch (Exception e) {
	        log.error("Initialization of connector failed");
			e.printStackTrace();
		}

		//start flows with autostart
       	List<Flow> flows = flowRepository.findAll();

       	try {
			for(Flow flow : flows) {
	       		if(flow.isAutoStart()) {
	       			String configuration;
	       			log.info("Autostart flow " + flow.getName() + " with id=" + flow.getId());
					configuration = assimblyDBConfiguration.convertDBToFlowConfiguration(flow.getId(),"xml/application",true);
					connector.setFlowConfiguration(flow.getId().toString(),"application/xml", configuration);
					connector.startFlow(flow.getId().toString());
	       		}
	       	}
    	} catch (Exception e) {
    		log.error("Autostart of flow failed (check configuration)");
			e.printStackTrace();
		}

	}

    @GetMapping(path = "/connector/{connectorId}/stats", produces = {"text/plain","application/xml","application/json"})
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
}
