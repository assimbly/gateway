package org.assimbly.gateway.config.camelroutes;

import java.util.Set;
import java.util.TreeMap;

import org.assimbly.gateway.domain.CamelRoute;
import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.repository.CamelRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class AssimblyDBConfiguration {

	private TreeMap<String, String> properties;

	private String options;
	private String componentType;
	private String uri;

	@Autowired
    private CamelRouteRepository camelRouteRepository;
		
	private FromEndpoint fromEndpoint;

	private ErrorEndpoint errorEndpoint;

	private Set<ToEndpoint> toEndpoints;

	private org.assimbly.gateway.domain.Service service;

	private Header header;

	public TreeMap<String, String> set(long connectorID) throws Exception {
	
	   properties = new TreeMap<String, String>();

	   setGeneralPropertiesFromAssimblyDB(connectorID);

		if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
			 throw new Exception("Set of configuration failed. Endpoint cannot be null");
		}

	   
	   //set from properties
	   setURIfromAssimblyDB("from");
	   setServiceFromAssimblyDB("from");
	   setHeaderFromAssimblyDB("from");
	   
	   //set to properties
	   setURIfromAssimblyDB("to");		   
	   setServiceFromAssimblyDB("to");
	   setHeaderFromAssimblyDB("to");

	   //set error properties
	   setURIfromAssimblyDB("error");
	   setServiceFromAssimblyDB("error");
	   setHeaderFromAssimblyDB("error");

	   //set up defaults settings if null -->
	    properties.put("id",Long.toString(connectorID));	
	   
	   	if(properties.get("from.uri") != null){
			properties.put("route","default");
		}else{
			properties.put("route", "none");
		}

		if(properties.get("to.uri") == null){
			properties.put("to.uri","mock:wastebin");		
		}
	   	   
		properties.put("header.contenttype", "text/xml;charset=UTF-8");
	   
	   return properties;

	}

	private void setGeneralPropertiesFromAssimblyDB(long connectorID) throws Exception{
		
        CamelRoute camelRoute = camelRouteRepository.findOne(connectorID);
        fromEndpoint = camelRoute.getFromEndpoint();
        errorEndpoint = camelRoute.getErrorEndpoint();
        toEndpoints = camelRoute.getToEndpoints();
        
	}

	private void setURIfromAssimblyDB(String type) {
		
		options = "";

		switch (type) {
		case "from":

				componentType = fromEndpoint.getType().name();
				uri = fromEndpoint.getUri();
				options = fromEndpoint.getOptions();

				setURIProperties(type, componentType, uri, options);
		
				break;
		case "to":

				for (ToEndpoint toEndpoint : toEndpoints) {

					componentType = toEndpoint.getType().name();
					uri = toEndpoint.getUri();
					options = toEndpoint.getOptions();

					setURIProperties(type, componentType, uri, options);
				}
			
				break;
		case "error":

				componentType = errorEndpoint.getType().name();
				uri = errorEndpoint.getUri();
				options = errorEndpoint.getOptions();

				setURIProperties(type, componentType, uri, options);

				break;
		}
	}	
	
	private void setURIProperties(String type, String componentType, String uri, String options) {
		
		componentType = componentType.toLowerCase();
		
		if(componentType.equals("file")||componentType.equals("sftp")) {
			componentType = componentType + "://";
		}else if(componentType.equals("http")) {
			componentType = "http4://";			
		}else {
			componentType = componentType + ":";
		}			
			
		if (options == null) {
			uri = componentType.toLowerCase() + uri;
		} else {
			uri = componentType.toLowerCase() + uri + "?" + options;
		}

		properties.put(type + ".uri", uri);
	}

	private void setServiceFromAssimblyDB(String type) {

		switch (type) {
	        case "from":
	
	        		service = fromEndpoint.getService();
		        	break;

	        case "to":
	
					for (ToEndpoint toEndpoint : toEndpoints) {
						service = toEndpoint.getService();			
					}
	
		            break;
	        
	        case "error":  
	        
	        		service = errorEndpoint.getService();
	        		break;
		}

	    if(service != null){
	    	setServiceProperties(type,service);	
	    }
		
	}

	private void setServiceProperties(String type, org.assimbly.gateway.domain.Service service) {
		properties.put(type + ".connection_id", service.getId().toString());
		properties.put(type + ".username", service.getUsername());
		properties.put(type + ".password", service.getPassword());
		properties.put(type + ".url", service.getUrl());
		properties.put(type + ".driver", service.getDriver());
		properties.put(type + ".configuration", service.getConfiguration());
	}	
	
	private void setHeaderFromAssimblyDB(String type) {

		switch (type) {
        case "from":

        	header = fromEndpoint.getHeader();
	        	
	        	break;
        case "to":

			for (ToEndpoint toEndpoint : toEndpoints) {

				header = toEndpoint.getHeader();			
			}

	            break;
        case "error":  

        		header = errorEndpoint.getHeader();
        		break;
			}


	    if(header != null){
		    Set<HeaderKeys> headerKeys = header.getHeaderKeys();
			
	    	for (HeaderKeys headerKey: headerKeys) {
		    		properties.put(type + ".header." + headerKey.getKey(),headerKey.getValue());
	    	}	    	
	    }
	}
}