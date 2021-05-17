package org.assimbly.gateway.web.rest;

import io.swagger.annotations.ApiParam;
import org.assimbly.connector.Connector;
import org.assimbly.connectorrest.ConnectorResource;

import org.assimbly.gateway.config.environment.DBConfiguration;
import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.HeaderRepository;
import org.assimbly.gateway.repository.ServiceRepository;
import org.assimbly.gateway.service.SecurityService;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.NativeWebRequest;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@ControllerAdvice
@RestController
@RequestMapping("/api")
public class MessageManagerResource {

    private final Logger log = LoggerFactory.getLogger(MessageManagerResource.class);

    private ConnectorResource connectorResource;

    @Autowired
    HeaderRepository headerRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    DBConfiguration assimblyDBConfiguration;

    Connector connector;

    public MessageManagerResource(ConnectorResource connectorResource) {
        this.connectorResource = connectorResource;
    }


    /**
     * POST  /connector/{connectorId}/send : Send messages to an endpoint (fire and forget).
     *
     * @param connectorId (gatewayId)
     * @return if message has been send
     * @throws Exception Message send failure
     */
    @PostMapping(path = "/connector/{connectorId}/send/{numberOfTimes}", consumes =  {"text/plain","application/xml","application/json"}, produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> send(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,
                                       @RequestHeader(name = "uri", required = false) String uri,
                                       @RequestHeader(name = "headerid", required = false) String headerId,
                                       @RequestHeader(name = "serviceid", required = false) String serviceId,
                                       @RequestHeader(name = "endpointid", required = false) String endpointId,
                                       @PathVariable Integer numberOfTimes,
                                       @PathVariable Long connectorId,
                                       @RequestBody Optional<String> requestBody) throws Exception {

        String body = requestBody.orElse(" ");

        TreeMap<String, String> serviceMap = new TreeMap<>();

        TreeMap<String, Object> headerMap = new TreeMap<>();

        connector = connectorResource.getConnector();

        try {
            if(serviceId != null && !serviceId.isBlank()) {
                serviceMap = getService(serviceId);
                serviceMap.put("to." + endpointId + ".uri",uri);
                serviceMap.put("to." + endpointId + ".service.id",serviceId);
                setService(serviceMap,endpointId);
            }

            if(headerId != null && !headerId.isBlank()) {
                headerMap = getHeaders(headerId);
            }

            if(!headerMap.isEmpty()){
                connector.sendWithHeaders(uri, body, headerMap, numberOfTimes);
            }else {
                connector.send(uri,body,numberOfTimes);
            }

            return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/send","Sent succesfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/send","Error: " + e.getMessage() + " Cause: " + e.getCause());
        }
    }

    /**
     * POST  /connector/{connectorId}/sendrequest : Send request messages to an endpoint.
     *
     * @param connectorId (gatewayId)
     * @return the reply message
     * @throws Exception Message send failure
     */
    @PostMapping(path = "/connector/{connectorId}/sendrequest", consumes =  {"text/plain","application/xml","application/json"}, produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> sendRequest(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,
                                       @RequestHeader(name = "uri", required = false) String uri,
                                       @RequestHeader(name = "headerid", required = false) String headerId,
                                       @RequestHeader(name = "serviceid", required = false) String serviceId,
                                       @RequestHeader(name = "endpointid", required = false) String endpointId,
                                       @PathVariable Long connectorId,
                                       @RequestBody Optional<String> requestBody) throws Exception {

        String body = requestBody.orElse(" ");
        String result = "No reply";

        connector = connectorResource.getConnector();

        TreeMap<String, String> serviceMap = new TreeMap<>();

        TreeMap<String, Object> headerMap = new TreeMap<>();

        try {
            if(serviceId != null && !serviceId.isBlank()) {
                serviceMap = getService(serviceId);
                serviceMap.put("to." + endpointId + ".uri",uri);
                serviceMap.put("to." + endpointId + ".service.id",serviceId);
                setService(serviceMap,endpointId);
            }

            if(headerId != null && !headerId.isBlank()) {
                headerMap = getHeaders(headerId);
            }

            if(!headerMap.isEmpty()){
                result = connector.sendRequestWithHeaders(uri, body, headerMap);
            }else {
                result = connector.sendRequest(uri,body);
            }

            return ResponseUtil.createSuccessResponse(connectorId, mediaType,"/connector/{connectorId}/send",result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.createFailureResponse(connectorId, mediaType,"/connector/{connectorId}/send",e.getMessage());
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

	private TreeMap<String, Object> getHeaders(String headerId){

        TreeMap<String, Object> headerMap = new TreeMap<>();

        Long headerIdLong =  Long.valueOf(headerId);
        Optional<Header> header = headerRepository.findById(headerIdLong);

        if(header.isPresent()){
            Set<HeaderKeys> headerKeys = header.get().getHeaderKeys();

            for (HeaderKeys headerKey : headerKeys) {
                String parameterName = headerKey.getKey();
                String parameterValue = headerKey.getValue();
                String parameterType = headerKey.getType();

                String key = headerKey.getKey();
                String value= headerKey.getType() + "(" + headerKey.getValue() + ")";

                headerMap.put(key, value);
            }
        }

        return headerMap;
    }

    private TreeMap<String, String> getService(String serviceId){

        TreeMap<String, String> serviceMap = new TreeMap<>();

        Long serviceIdLong =  Long.valueOf(serviceId);
        Optional<Service> service = serviceRepository.findById(serviceIdLong);

        if(service.isPresent()){
            Set<ServiceKeys> serviceKeys = service.get().getServiceKeys();

            for (ServiceKeys serviceKey : serviceKeys) {
                String key = "service." + serviceId + "." +  serviceKey.getKey();
                String value = serviceKey.getValue();
                serviceMap.put(key, value);
            }
        }

        return serviceMap;
    }


    private void setService(TreeMap<String, String> serviceMap, String endpointId) throws Exception {
        connector = connectorResource.getConnector();
        connector.setConnection(serviceMap,"to." + endpointId + ".service.id");
    }

}
