package org.assimbly.gateway.web.rest.util;

import java.sql.Timestamp;

import org.json.JSONObject;
import org.json.XML;

/**
 * Utility class for HTTP body creation.
 */
public final class BodyUtil {

    private BodyUtil() {
    }

    public static String createSuccessJSONResponse(Long id, String path, String message) throws Exception {
        
        JSONObject responseBody = new JSONObject();
        responseBody.put("id", id.toString());
        responseBody.put("timestamp", new Timestamp(System.currentTimeMillis()));
        responseBody.put("status", 200);
        responseBody.put("details", "succesful");
        responseBody.put("path", path);
        responseBody.put("message", message);
        
        return responseBody.toString();
        
	}
    
    public static String createFailureJSONResponse(Long id, String path, String message) throws Exception {
  	
        JSONObject responseBody = new JSONObject();
        responseBody.put("id", id.toString());
        responseBody.put("timestamp", new Timestamp(System.currentTimeMillis()));
        responseBody.put("status", 400);
        responseBody.put("details", "failed. See the log for a complete stack trace");
        responseBody.put("path", path);
        responseBody.put("message", message);
        
        return responseBody.toString();
        
	}

    public static String createSuccessXMLResponse(Long id, String path, String message) throws Exception {
        
        JSONObject responseBody = new JSONObject();
        responseBody.put("id", id.toString());
        responseBody.put("timestamp", new Timestamp(System.currentTimeMillis()));
        responseBody.put("status", 200);
        responseBody.put("details", "succesful");
        responseBody.put("path", path);
        responseBody.put("message", message);
        
        String responseBodyXml = "<response>"+ System.lineSeparator() + XML.toString(responseBody) + System.lineSeparator() + "</response>";
        
        return responseBodyXml;
	}
    
    public static String createFailureXMLResponse(Long id, String path, String message) throws Exception {
  	
        JSONObject responseBody = new JSONObject();
        responseBody.put("id", id.toString());
        responseBody.put("timestamp", new Timestamp(System.currentTimeMillis()));
        responseBody.put("status", 400);
        responseBody.put("details", "failed. See the log for a complete stack trace");
        responseBody.put("path", path);
        responseBody.put("message", message);
        
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
