package org.assimbly.gateway.config.camelroutes;

import java.util.ArrayList;
import java.util.List;
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

	private List<TreeMap<String,String>> configuration  = new ArrayList<>();;
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

	public TreeMap<String, String> convertDBToRouteConfiguration(Long id) throws Exception {
	
	   properties = new TreeMap<String, String>();

       CamelRoute camelRoute = camelRouteRepository.findOne(id);
    
	   getGeneralPropertiesFromDB(camelRoute);
	      
		if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
			 throw new Exception("Set of configuration failed. Endpoint cannot be null");
		}else {
			getEndpointPropertiesFromDB(camelRoute);	
		}
	   
	   return properties;

	}

	public TreeMap<String, String> convertDBToRouteConfiguration(CamelRoute camelRoute) throws Exception {
		
		   properties = new TreeMap<String, String>();

		   getGeneralPropertiesFromDB(camelRoute);
		      
			if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
				 throw new Exception("Set of configuration failed. Endpoint cannot be null");
			}else {
				getEndpointPropertiesFromDB(camelRoute);	
			}
		   
		   return properties;

		}
	
	public void importConfiguration(String xmlConfiguration) {
		//todo
	}
	
	public String exportConfiguration() {
		//todo
		return "xmlconfiguration";
	}	

	
	//private methods
	
	private void getGeneralPropertiesFromDB(CamelRoute camelRoute) throws Exception{

        fromEndpoint = camelRoute.getFromEndpoint();
        errorEndpoint = camelRoute.getErrorEndpoint();
        toEndpoints = camelRoute.getToEndpoints();
        
	}

	private void getEndpointPropertiesFromDB(CamelRoute camelRoute) throws Exception{
		   
		   //set from properties
		   getURIfromAssimblyDB("from");
		   getServiceFromAssimblyDB("from");
		   getHeaderFromAssimblyDB("from");
		   
		   //set to properties
		   getURIfromAssimblyDB("to");		   
		   getServiceFromAssimblyDB("to");
		   getHeaderFromAssimblyDB("to");

		   //set error properties
		   getURIfromAssimblyDB("error");
		   getServiceFromAssimblyDB("error");
		   getHeaderFromAssimblyDB("error");

		   //set up defaults settings if null -->
		    properties.put("id",Long.toString(camelRoute.getId()));	
		   
		   	if(properties.get("from.uri") != null){
				properties.put("route","default");
			}else{
				properties.put("route", "none");
			}

			if(properties.get("to.uri") == null){
				properties.put("to.uri","mock:wastebin");		
			}
		   	   
			properties.put("header.contenttype", "text/xml;charset=UTF-8");
        
	}
	
	private void getURIfromAssimblyDB(String type) {
		
		options = "";

		switch (type) {
		case "from":

				componentType = fromEndpoint.getType().name();
				uri = fromEndpoint.getUri();
				options = fromEndpoint.getOptions();

				getURIProperties(type, componentType, uri, options);
		
				break;
		case "to":

				for (ToEndpoint toEndpoint : toEndpoints) {

					componentType = toEndpoint.getType().name();
					uri = toEndpoint.getUri();
					options = toEndpoint.getOptions();

					getURIProperties(type, componentType, uri, options);
				}
			
				break;
		case "error":

				componentType = errorEndpoint.getType().name();
				uri = errorEndpoint.getUri();
				options = errorEndpoint.getOptions();

				getURIProperties(type, componentType, uri, options);

				break;
		}
	}	
	
	private void getURIProperties(String type, String componentType, String uri, String options) {
		
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

	private void getServiceFromAssimblyDB(String type) {

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
	    	getServiceProperties(type,service);	
	    }
		
	}

	private void getServiceProperties(String type, org.assimbly.gateway.domain.Service service) {
		properties.put(type + ".connection_id", service.getId().toString());
		properties.put(type + ".username", service.getUsername());
		properties.put(type + ".password", service.getPassword());
		properties.put(type + ".url", service.getUrl());
		properties.put(type + ".driver", service.getDriver());
		properties.put(type + ".configuration", service.getConfiguration());
	}	
	
	private void getHeaderFromAssimblyDB(String type) {

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
	
	public List<TreeMap<String,String>> convertDBtoConfiguration(Long gatewayid) throws Exception {

		List<CamelRoute> camelRoutes = camelRouteRepository.findAllByGatewayId(gatewayid);
		
		for(CamelRoute camelRoute : camelRoutes){
			if(camelRoute!=null) {
				TreeMap<String, String> routeConfiguration = convertDBToRouteConfiguration(camelRoute);
				if(routeConfiguration!=null) {
					this.configuration.add(routeConfiguration);
				}
			}
		}
		
		return configuration;
	}
	
}