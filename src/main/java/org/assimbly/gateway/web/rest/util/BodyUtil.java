package org.assimbly.gateway.web.rest.util;

import org.json.JSONObject;
import org.json.XML;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

/**
 * Utility class for HTTP body creation.
 */
public final class BodyUtil {

    private BodyUtil() {
    }

    public static String createSuccessJSONResponse(Long id, String action, String message) throws Exception {
        
        JSONObject responseBody = new JSONObject();
        responseBody.put("id", id.toString());
        responseBody.put("action", action);
        responseBody.put("status", "succesful");
        responseBody.put("statusCode", "200");
        responseBody.put("message", message);
        
        return responseBody.toString();
	}
    
    public static String createFailureJSONResponse(Long id, String action, String message) throws Exception {
  	
        JSONObject responseBody = new JSONObject();
        responseBody.put("id", id.toString());
        responseBody.put("action", action);
        responseBody.put("status", "failed");
        responseBody.put("statusCode", 400);
        responseBody.put("message", message);
        responseBody.put("details", "See log for complete stack trace");
        
        return responseBody.toString();
        
	}

    public static String createSuccessXMLResponse(Long id, String action, String message) throws Exception {
        
        JSONObject responseBody = new JSONObject();
        responseBody.put("id", id.toString());
        responseBody.put("action", action);
        responseBody.put("status", "succesful");
        responseBody.put("statusCode", "200");
        responseBody.put("message", message);
        
        String responseBodyXml = "<response>"+ System.lineSeparator() + XML.toString(responseBody) + System.lineSeparator() + "</response>";
        
        return responseBodyXml;
	}
    
    public static String createFailureXMLResponse(Long id, String action, String message) throws Exception {
  	
        JSONObject responseBody = new JSONObject();
        responseBody.put("id", id.toString());
        responseBody.put("action", action);
        responseBody.put("status", "failed");
        responseBody.put("statusCode", 400);
        responseBody.put("message", message);
        responseBody.put("details", "See log for complete stack trace");

        String responseBodyXml = "<response>" + System.lineSeparator() + XML.toString(responseBody) + System.lineSeparator() + "</response>";
        
        return responseBodyXml;        
	}
    
    public static String createSuccessTEXTResponse(String message) throws Exception {        
        return message;
	}
    
    public static String createFailureTEXTResponse(String message) throws Exception {  	
        return message;        
	}
    
}
