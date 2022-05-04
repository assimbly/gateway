package org.assimbly.gateway.web.rest.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;

/**
 * Utility class for HTTP body creation.
 */
public final class ResponseUtil {

    private final static Logger log = LoggerFactory.getLogger(ResponseUtil.class);
	
    private static ResponseEntity<String> response;


	private ResponseUtil() {
    }

    
    public static ResponseEntity<String> createSuccessResponse(long gatewayId, String mediaType, String path, String message) throws Exception{

    	log.debug("REST request with path " + path + " for gateway with id " + gatewayId);
    	
    	switch (mediaType.toLowerCase()) {    	
	        case "application/json":
	        	response = ResponseEntity.ok()
	        		.body(BodyUtil.createSuccessJSONResponse(gatewayId, path, message));
	            break;
	        case "application/xml":
	        	response = ResponseEntity.ok()
	        		.body(BodyUtil.createSuccessXMLResponse(gatewayId, path, message));
	            break;
	        default: 
	        	response = ResponseEntity.ok()
	        		.body(BodyUtil.createSuccessTEXTResponse(message));
	            break;
    	}
    	
   		return response;    	
    }

    public static ResponseEntity<String> createSuccessResponse(long gatewayId, String mediaType, String path, String message, boolean plainResponse) throws Exception{

    	log.debug("REST request with path " + path + " for gateway with id " + gatewayId);
    
    	if(plainResponse) {
        	response = ResponseEntity.ok()
	        		.body(message);
    	}else {

        	switch (mediaType.toLowerCase()) {    	
		        case "application/json":
		        	response = ResponseEntity.ok()
		        		.body(BodyUtil.createSuccessJSONResponse(gatewayId, path, message));
		            break;
		        case "application/xml":
		        	response = ResponseEntity.ok()
		        		.body(BodyUtil.createSuccessXMLResponse(gatewayId, path, message));
		            break;
		        default: 
		        	response = ResponseEntity.ok()
		        		.body(BodyUtil.createSuccessTEXTResponse(message));
		            break;
        	}
    	}
    	
    	return response;	
   	}
    
    
    public static ResponseEntity<String> createSuccessResponseWithHeaders(long gatewayId, String mediaType, String path, String message, String headerMessage, String headerParam) throws Exception{

    	log.debug("REST request with path " + path + " for gateway with id " + gatewayId);
    	
    	switch (mediaType.toLowerCase()) {    	
	        case "application/json":
	        	response = ResponseEntity.ok().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createSuccessJSONResponse(gatewayId, path, message));
	            break;
	        case "application/xml":
	        	response = ResponseEntity.ok().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createSuccessXMLResponse(gatewayId, path, message));
	            break;
	        default: 
	        	response = ResponseEntity.ok().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createSuccessTEXTResponse(message));
	            break;
    	}
    	
   		return response;    	
    }    
    
    public static ResponseEntity<String> createFailureResponse(long gatewayId, String mediaType, String path, String message) throws Exception{

		log.error("REST request with path " + path + " for gateway with id " + gatewayId + " failed.");

    	switch (mediaType.toLowerCase()) {    	
	        case "application/json":
	        	response = ResponseEntity.badRequest()
	        		.body(BodyUtil.createFailureJSONResponse(gatewayId, path, message));
	            break;
	        case "application/xml":
	        	response = ResponseEntity.badRequest()
	        		.body(BodyUtil.createFailureXMLResponse(gatewayId, path, message));
	
	            break;
	        default: 
	        	response = ResponseEntity.badRequest()
	        		.body(BodyUtil.createFailureTEXTResponse(message));
	            break;
    	}
		
		return response;
	}	

    
    public static ResponseEntity<String> createFailureResponseWithHeaders(long gatewayId, String mediaType, String path, String message, String headerMessage, String headerParam) throws Exception{

		log.error("REST request with path " + path + " for gateway with id " + gatewayId + " failed.");

    	switch (mediaType.toLowerCase()) {    	
	        case "application/json":
	        	response = ResponseEntity.status(400).headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createFailureJSONResponse(gatewayId, path, message));
	            break;
	        case "application/xml":
	        	response = ResponseEntity.badRequest().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createFailureXMLResponse(gatewayId, path, message));
	
	            break;
	        default: 
	        	response = ResponseEntity.badRequest().headers(HeaderUtil.createAlert(headerMessage,headerParam))
	        		.body(BodyUtil.createFailureTEXTResponse(message));
	            break;
    	}
		
		return response;
	}
    
}
