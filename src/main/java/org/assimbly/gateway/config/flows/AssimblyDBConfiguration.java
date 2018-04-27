package org.assimbly.gateway.config.flows;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.ServiceKeys;
import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.repository.FlowRepository;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

@Service
public class AssimblyDBConfiguration {

    public static int PRETTY_PRINT_INDENT_FACTOR = 4;

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
	private String xmlConfiguration;
	private Element rootElement;
	private Document doc;
	private Element flows;
	private Element services;
	private Element headers;
	private Element flow;
	private String connectorId;
	private String jsonConfiguration;


	
	public List<TreeMap<String,String>> convertDBToConfiguration(Long gatewayid) throws Exception {

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
	
	public TreeMap<String, String> convertDBToFlowConfiguration(Long id) throws Exception {
	
	   properties = new TreeMap<String, String>();

       Flow flow = flowRepository.findOne(id);

		if (flow == null) {
			 throw new Exception("Flow ID does not exists");
		}
		
	   getGeneralFlowPropertiesFromDB(flow);
	      
		if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
			 throw new Exception("Set of configuration failed. Endpoint cannot be null");
		}else {
			getEndpointPropertiesFromDB(flow);	
		}
	   
	   return properties;

	}

	public String convertDBToXMLConfiguration(Long gatewayId) throws Exception {

		List<Flow> flows = flowRepository.findAllByGatewayId(gatewayId);
		connectorId = gatewayId.toString();
		setGeneralPropertiesFromDB(connectorId);
		
		for(Flow flow : flows){
			if(flow!=null) {
				convertDBToXMLFlowConfiguration(flow);
			}
		}

	   xmlConfiguration = convertDocToString(doc);

		return xmlConfiguration;
	}
	
	public String convertDBToXMLFlowConfiguration(Long id) throws Exception {
				
	       Flow flow = flowRepository.findOne(id);
		   connectorId = flow.getGateway().getId().toString();
		   setGeneralPropertiesFromDB(connectorId);

		   getGeneralFlowPropertiesFromDB(flow);
			if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
				 throw new Exception("Set of configuration failed. Endpoint cannot be null");
			}else {
				setFlowPropertiesFromDB(flow);
			}
		   
		   
		   
		   xmlConfiguration = convertDocToString(doc);
		   
		   return xmlConfiguration;

		}

	public String convertDBToJSONConfiguration(Long gatewayId) throws Exception {
		
		xmlConfiguration = convertDBToXMLConfiguration(gatewayId);
		
        JSONObject xmlJSONObj = XML.toJSONObject(xmlConfiguration);
        jsonConfiguration = xmlJSONObj.toString(PRETTY_PRINT_INDENT_FACTOR);
		
		return jsonConfiguration;

	}
	
	public String convertDBToJSONFlowConfiguration(Long id) throws Exception {
		
		xmlConfiguration = convertDBToXMLFlowConfiguration(id);
		
        JSONObject xmlJSONObj = XML.toJSONObject(xmlConfiguration);
        jsonConfiguration = xmlJSONObj.toString(PRETTY_PRINT_INDENT_FACTOR);
		
		return jsonConfiguration;

	}
	
	//private methods
	private String convertDBToXMLFlowConfiguration(Flow flow) throws Exception {
	
		   getGeneralFlowPropertiesFromDB(flow);

		   if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
				 throw new Exception("Set of configuration failed. Endpoint cannot be null");
			}else {
				setFlowPropertiesFromDB(flow);
			}
		   xmlConfiguration = convertDocToString(doc);
		   
		   return xmlConfiguration;

	}

	private TreeMap<String, String> convertDBToFlowConfiguration(Flow flow) throws Exception {
		
		   properties = new TreeMap<String, String>();

		   getGeneralFlowPropertiesFromDB(flow);
		      
			if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
				 throw new Exception("Set of configuration failed. Endpoint cannot be null");
			}else {
				getEndpointPropertiesFromDB(flow);	
			}
		   
		   return properties;

		}

	private void getGeneralFlowPropertiesFromDB(Flow flow) throws Exception{

        fromEndpoint = flow.getFromEndpoint();
        errorEndpoint = flow.getErrorEndpoint();
        toEndpoints = flow.getToEndpoints();
        
	}

	//Treemap get methods
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

			if(properties.get("to.uri") == null || properties.get("to.uri").startsWith("wastebin")){
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

	//XML set methods
	private void setGeneralPropertiesFromDB(String connectorId) throws ParserConfigurationException {

	    DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
	    DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
	    doc = docBuilder.newDocument();

	    rootElement = doc.createElement("connector");
	    doc.appendChild(rootElement);

	    Element id = doc.createElement("id");
	    id.appendChild(doc.createTextNode(connectorId));
	    rootElement.appendChild(id);
	    
	    flows = doc.createElement("flows");
	    services = doc.createElement("services");
	    headers = doc.createElement("headers");
	    
	    rootElement.appendChild(flows);
	    rootElement.appendChild(services);
	    rootElement.appendChild(headers);
		
	}
	
	
	private void setFlowPropertiesFromDB(Flow flowDB) throws Exception {

	    flow = doc.createElement("flow");
	    flows.appendChild(flow);
	    
	    //set id
	    String flowId = flowDB.getId().toString();	    
	    Element id = doc.createElement("id");
	    id.appendChild(doc.createTextNode(flowId));
	    flow.appendChild(id);
   
	    //set endpoints
	    setFromEndpointFromDB(fromEndpoint);
	    setToEndpointsFromDB(toEndpoints);
	    setErrorEndpointFromDB(errorEndpoint);
	    
	}
	
	private void setFromEndpointFromDB(FromEndpoint fromEndpointDB) throws Exception {

		String confUri = fromEndpointDB.getUri();
		String confcomponentType = fromEndpointDB.getType().toString();
		String confOptions = fromEndpointDB.getOptions();
		org.assimbly.gateway.domain.Service confService = fromEndpointDB.getService();
		Header confHeader = fromEndpointDB.getHeader();

		if(confUri!=null) {

		    Element endpoint = doc.createElement("from");
		    Element uri = doc.createElement("uri");
			flow.appendChild(endpoint);
			
			componentType = confcomponentType.toLowerCase();
			
			if(componentType.equals("file")||componentType.equals("sftp")) {
				componentType = componentType + "://";
			}else if(componentType.equals("http")) {
				componentType = "http4://";			
			}else {
				componentType = componentType + ":";
			}			

			confUri = componentType + confUri;
		    uri.setTextContent(confUri);	
			endpoint.appendChild(uri);
				
			if(confOptions!=null) {
				
			    Element options = doc.createElement("options");
			    endpoint.appendChild(options);
			    
			    String[] confOptionsSplitted = confOptions.split(",");
			    
			    if(confOptionsSplitted.length>0) {
			    
				    for(String confOption : confOptionsSplitted) {
				    	String[] confOptionSplitted = confOption.split("=");
	
				    	if(confOptionSplitted.length>0){
				    		Element option = doc.createElement(confOptionSplitted[0]);
						    option.setTextContent(confOptionSplitted[1]);	
				    		options.appendChild(option);
				    	}
				    }
			    }else {
			    	
			    	String[] confOptionSplitted = confOptions.split("=");
			    	
			    	if(confOptionSplitted.length>0){
			    		Element option = doc.createElement(confOptionSplitted[0]);
					    option.setTextContent(confOptionSplitted[1]);	
			    		options.appendChild(option);
			    	}
		    	
			    }
			}
			
		    if(confService!=null) {
		    	String confServiceId = confService.getId().toString();
			    Element serviceId = doc.createElement("service_id");
			    
			    serviceId.setTextContent(confServiceId);
		    	endpoint.appendChild(serviceId);
			    setServiceFromDB(confServiceId, "from", confService);
			}

		    if(confHeader!=null) {
		    	String confHeaderId = confService.getId().toString();
			    Element headerId = doc.createElement("service_id");
		    	
			    endpoint.appendChild(headerId);
			    headerId.setTextContent(confHeaderId);
			    setHeaderFromDB(confHeaderId, "from", confHeader);
			}

			
		}
	}

	private void setToEndpointsFromDB(Set<ToEndpoint> toEndpointsDB) throws Exception {
	
		for (ToEndpoint toEndpointDB : toEndpointsDB) {

			String confUri = toEndpointDB.getUri();

			String confcomponentType = toEndpointDB.getType().toString();
			String confOptions = toEndpointDB.getOptions();
			org.assimbly.gateway.domain.Service confService = toEndpointDB.getService();
			Header confHeader = toEndpointDB.getHeader();

			if(confUri!=null) {

			    Element endpoint = doc.createElement("to");
			    Element uri = doc.createElement("uri");
				flow.appendChild(endpoint);
				
				componentType = confcomponentType.toLowerCase();
				
				if(componentType.equals("file")||componentType.equals("sftp")) {
					componentType = componentType + "://";
				}else if(componentType.equals("http")) {
					componentType = "http4://";			
				}else {
					componentType = componentType + ":";
				}			

				confUri = componentType + confUri;
			    uri.setTextContent(confUri);	
				endpoint.appendChild(uri);
					
				if(confOptions!=null) {
				    Element options = doc.createElement("options");
				    endpoint.appendChild(options);
				    
				    String[] confOptionsSplitted = confOptions.split(",");
				    
				    for(String confOption : confOptionsSplitted) {
				    	String[] confOptionSplitted = confOption.split("=");

				    	if(confOptionSplitted.length>1){
				    		Element option = doc.createElement(confOptionSplitted[0]);
						    option.setTextContent(confOptionSplitted[1]);	
				    		options.appendChild(option);
				    	}
				    }
				}
				
			    if(confService!=null) {
			    	String confServiceId = confService.getId().toString();
				    Element serviceId = doc.createElement("service_id");
				    
				    serviceId.setTextContent(confServiceId);
			    	endpoint.appendChild(serviceId);
				    setServiceFromDB(confServiceId, "to", confService);
				}

			    if(confHeader!=null) {
			    	String confHeaderId = confService.getId().toString();
				    Element headerId = doc.createElement("service_id");
			    	
				    endpoint.appendChild(headerId);
				    headerId.setTextContent(confHeaderId);
				    setHeaderFromDB(confHeaderId, "to", confHeader);
				}				
			}			
		}
	}
	
	private void setErrorEndpointFromDB(ErrorEndpoint errorEndpointDB) throws Exception {

		String confUri = errorEndpointDB.getUri();
		String confcomponentType = errorEndpointDB.getType().toString();
		String confOptions = errorEndpointDB.getOptions();
		org.assimbly.gateway.domain.Service confService = errorEndpointDB.getService();
		Header confHeader = errorEndpointDB.getHeader();

		if(confUri!=null) {

		    Element endpoint = doc.createElement("error");
		    Element uri = doc.createElement("uri");
			flow.appendChild(endpoint);
			
			componentType = confcomponentType.toLowerCase();
			
			if(componentType.equals("file")||componentType.equals("sftp")) {
				componentType = componentType + "://";
			}else if(componentType.equals("http")) {
				componentType = "http4://";			
			}else {
				componentType = componentType + ":";
			}			

			confUri = componentType + confUri;
		    uri.setTextContent(confUri);	
			endpoint.appendChild(uri);
				
			if(confOptions!=null) {
			    Element options = doc.createElement("options");
			    endpoint.appendChild(options);
			    
			    String[] confOptionsSplitted = confOptions.split(",");
			    
			    for(String confOption : confOptionsSplitted) {
			    	String[] confOptionSplitted = confOption.split("=");

			    	if(confOptionSplitted.length>1){
			    		Element option = doc.createElement(confOptionSplitted[0]);
					    option.setTextContent(confOptionSplitted[1]);	
			    		options.appendChild(option);
			    	}
			    }
			}
			
		    if(confService!=null) {
		    	String confServiceId = confService.getId().toString();
			    Element serviceId = doc.createElement("service_id");
			    
			    serviceId.setTextContent(confServiceId);
		    	endpoint.appendChild(serviceId);
			    setServiceFromDB(confServiceId, "error", errorEndpointDB.getService());
			}

		    if(confHeader!=null) {
		    	String confHeaderId = confService.getId().toString();
			    Element headerId = doc.createElement("service_id");
		    	
			    endpoint.appendChild(headerId);
			    headerId.setTextContent(confHeaderId);
			    setHeaderFromDB(confHeaderId, "error", errorEndpointDB.getHeader());
			}
		}
	}

	
	
	private void setServiceFromDB(String serviceid, String type, org.assimbly.gateway.domain.Service serviceDB) throws Exception {

	    Element service = doc.createElement("service");
	    services.appendChild(service);

	    Element id = doc.createElement("id");
	    id.appendChild(doc.createTextNode(serviceDB.getId().toString()));
	    service.appendChild(id);

	    Set<ServiceKeys> serviceKeys = serviceDB.getServiceKeys();
	    
		for(ServiceKeys serviceKey : serviceKeys) {
			String parameterName = serviceKey.getKey();
			String parameterValue = serviceKey.getValue();
			  
			Element serviceParameter = doc.createElement(parameterName);
			serviceParameter.setTextContent(parameterValue);
			service.appendChild(serviceParameter);
		}

	    
	}
	
	private void setHeaderFromDB(String headerid, String type, Header headerDB) throws Exception {

	    Element header = doc.createElement("header");
	    headers.appendChild(header);

	    Element id = doc.createElement("id");
	    id.appendChild(doc.createTextNode(headerDB.getId().toString()));
	    header.appendChild(id);

	    Set<HeaderKeys> headerKeys = headerDB.getHeaderKeys();
	    
	    
		for(HeaderKeys headerKey : headerKeys) {
			String parameterName = headerKey.getKey();
			String parameterValue = headerKey.getValue();
			  
			Element headerParameter = doc.createElement(parameterName);
			headerParameter.setTextContent(parameterValue);
			header.appendChild(headerParameter);
		}
	}
	
	public static String convertDocToString(Document doc) {
	    try {
	        StringWriter sw = new StringWriter();
	        TransformerFactory tf = TransformerFactory.newInstance();
	        Transformer transformer = tf.newTransformer();
	        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
	        transformer.setOutputProperty(OutputKeys.METHOD, "xml");
	        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
	        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

	        transformer.transform(new DOMSource(doc), new StreamResult(sw));
	        return sw.toString();
	    } catch (Exception ex) {
	        throw new RuntimeException("Error converting to String", ex);
	    }
	}

}