package org.assimbly.gateway.config.flows;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.repository.FlowRepository;
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
    private FlowRepository flowRepository;
		
	private FromEndpoint fromEndpoint;

	private ErrorEndpoint errorEndpoint;

	private Set<ToEndpoint> toEndpoints;

	private org.assimbly.gateway.domain.Service service;

	private Header header;

	public TreeMap<String, String> convertDBToFlowConfiguration(Long id) throws Exception {
	
	   properties = new TreeMap<String, String>();

       Flow flow = flowRepository.findOne(id);
    
	   getGeneralPropertiesFromDB(flow);
	      
		if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
			 throw new Exception("Set of configuration failed. Endpoint cannot be null");
		}else {
			getEndpointPropertiesFromDB(flow);	
		}
	   
	   return properties;

	}

	public TreeMap<String, String> convertDBToFlowConfiguration(Flow flow) throws Exception {
		
		   properties = new TreeMap<String, String>();

		   getGeneralPropertiesFromDB(flow);
		      
			if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
				 throw new Exception("Set of configuration failed. Endpoint cannot be null");
			}else {
				getEndpointPropertiesFromDB(flow);	
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
	
	private void getGeneralPropertiesFromDB(Flow flow) throws Exception{

        fromEndpoint = flow.getFromEndpoint();
        errorEndpoint = flow.getErrorEndpoint();
        toEndpoints = flow.getToEndpoints();
        
	}

	private void getEndpointPropertiesFromDB(Flow flow) throws Exception{
		   
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
		    properties.put("id",Long.toString(flow.getId()));	
		   
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
		properties.put(type + ".service.id", service.getId().toString());
		properties.put(type + ".service.username", service.getUsername());
		properties.put(type + ".service.password", service.getPassword());
		properties.put(type + ".service.url", service.getUrl());
		properties.put(type + ".service.driver", service.getDriver());
		properties.put(type + ".service.configuration", service.getConfiguration());
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

		List<Flow> flows = flowRepository.findAllByGatewayId(gatewayid);
		
		for(Flow flow : flows){
			if(flow!=null) {
				TreeMap<String, String> flowConfiguration = convertDBToFlowConfiguration(flow);
				if(flowConfiguration!=null) {
					this.configuration.add(flowConfiguration);
				}
			}
		}
		
		return configuration;
	}
	
}