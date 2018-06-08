package org.assimbly.gateway.config.environment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.domain.Gateway;
import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.domain.ServiceKeys;
import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.domain.enumeration.EndpointType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.repository.HeaderRepository;
import org.assimbly.gateway.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

@Service
public class DBConfiguration {

    public static int PRETTY_PRINT_INDENT_FACTOR = 4;

	private List<TreeMap<String,String>> propertiesList  = new ArrayList<>();;
	private TreeMap<String, String> properties;

	private String options;
	private String componentType;
	private String uri;

	@Autowired
    private GatewayRepository gatewayRepository;

	@Autowired
    private FlowRepository flowRepository;

	@Autowired
    private ServiceRepository serviceRepository;

	@Autowired
    private HeaderRepository headerRepository;

	
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

	private List<String> servicesList;
    private List<String> headersList;

	private String configuration;

	private ToEndpoint toEndpoint;

	private Set<ServiceKeys> serviceKeys;

	private long serviceIdLong;

	private Set<HeaderKeys> headerKeys;

	private long headerIdLong;
	
	public List<TreeMap<String,String>> convertDBToConfiguration(Long gatewayid) throws Exception {

		List<Flow> flows = flowRepository.findAllByGatewayId(gatewayid);
		
		for(Flow flow : flows){
			if(flow!=null) {
				TreeMap<String, String> flowConfiguration = convertDBToFlowConfiguration(flow);
				if(flowConfiguration!=null) {
					this.propertiesList.add(flowConfiguration);
				}
			}
		}
		
		return propertiesList;
	}

	public String convertDBToConfiguration(Long gatewayId, String mediaType) throws Exception {

		List<Flow> flows = flowRepository.findAllByGatewayId(gatewayId);
		connectorId = gatewayId.toString();
		setGeneralPropertiesFromDB(connectorId);
		
		for(Flow flow : flows){
			if(flow!=null) {
				convertDBToXMLFlowConfiguration(flow);
			}
		}

	   xmlConfiguration = ConvertUtil.convertDocToString(doc);

	   if(mediaType.contains("json")) {
			configuration = ConvertUtil.convertJsonToXml(xmlConfiguration);
		}else if(mediaType.contains("yaml") || mediaType.contains("text")) {
			//xmlConfiguration = ConvertUtil.convertYamltoXml(flowConfiguration);
		}else {
			configuration = xmlConfiguration;
		}
	   
		return configuration;
	}

	public String convertDBToConfiguration(Long gatewayId, String mediaType, Boolean autoStart) throws Exception {

		List<Flow> flows = flowRepository.findAllByGatewayId(gatewayId);
		connectorId = gatewayId.toString();
		setGeneralPropertiesFromDB(connectorId);
		
		for(Flow flow : flows){
			if(flow!=null && autoStart) {
				if(flow.isAutoStart()) {
				convertDBToXMLFlowConfiguration(flow);
				}
			}else if(flow!=null && !autoStart) {
				if(!flow.isAutoStart()) {
					convertDBToXMLFlowConfiguration(flow);
				}
			}
		}

	   xmlConfiguration = ConvertUtil.convertDocToString(doc);

	   if(mediaType.contains("json")) {
			configuration = ConvertUtil.convertJsonToXml(xmlConfiguration);
		}else if(mediaType.contains("yaml") || mediaType.contains("text")) {
			//xmlConfiguration = ConvertUtil.convertYamltoXml(flowConfiguration);
		}else {
			configuration = xmlConfiguration;
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
	
	public String convertDBToFlowConfiguration(Long id, String mediaType) throws Exception {
				
	       Flow flow = flowRepository.findOne(id);
		   connectorId = flow.getGateway().getId().toString();
		   setGeneralPropertiesFromDB(connectorId);

		   getGeneralFlowPropertiesFromDB(flow);
			if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
				 throw new Exception("Set of configuration failed. Endpoint cannot be null");
			}else {
				setFlowPropertiesFromDB(flow);
			}
		   
		   xmlConfiguration = ConvertUtil.convertDocToString(doc);
		   
		   if(mediaType.contains("json")) {
				configuration = ConvertUtil.convertXmlToJson(xmlConfiguration);
			}else if(mediaType.contains("yaml") || mediaType.contains("text")) {
				//xmlConfiguration = ConvertUtil.convertXmltoYaml(flowConfiguration);
			}else {
				configuration = xmlConfiguration;
			}
		   
		   return configuration;

		}

	public String  convertConfigurationToDB(Long connectorId, String mediaType, String configuration) throws Exception {
		
		if(mediaType.contains("json")) {
			xmlConfiguration = ConvertUtil.convertJsonToXml(configuration);
		}else if(mediaType.contains("yaml") || mediaType.contains("text")) {
			//xmlConfiguration = ConvertUtil.convertYamltoXml(flowConfiguration);
		}else {
			xmlConfiguration = configuration;
		}

		Document doc = ConvertUtil.convertStringToDoc(xmlConfiguration);
		
		//create services
		List<String> serviceIds = getList(doc, "/connectors/connector/services/service/id/text()");
		setServicesPropertiesFromXML(doc, serviceIds);

		//create headers
		List<String> headerIds = getList(doc, "/connectors/connector/headers/header/id/text()");
		setHeadersPropertiesFromXML(doc, headerIds);

		//create flows
		List<String> flowIds = getList(doc, "/connectors/connector/flows/flow/id/text()");		
		convertFlowConfigurationToDB(doc, connectorId, flowIds);
				
		return "ok";		
		
	}
	
	public String convertFlowConfigurationToDB(Long connectorId, Long id, String mediaType, String flowConfiguration) throws Exception {
		
		if(mediaType.contains("json")) {
			xmlConfiguration = ConvertUtil.convertJsonToXml(flowConfiguration);
		}else if(mediaType.contains("yaml") || mediaType.contains("text")) {
			//xmlConfiguration = ConvertUtil.convertYamltoXml(flowConfiguration);
		}else {
			xmlConfiguration = flowConfiguration;
		}
		
		Document doc = ConvertUtil.convertStringToDoc(xmlConfiguration);

		//get servicesID's
		List<String> serviceIds = getListFromFlow(doc, id, "service");
		setServicesPropertiesFromXML(doc, serviceIds);

		//get headersID's
		List<String> headerIds = getListFromFlow(doc, id, "header");
		setHeadersPropertiesFromXML(doc, headerIds);

		String result = setFlowPropertiesFromXML(doc, connectorId,id);
		
		return result;
		
	}


	//private methods
	private String convertDBToXMLFlowConfiguration(Flow flow) throws Exception {
	
		   getGeneralFlowPropertiesFromDB(flow);

		   if (fromEndpoint == null || toEndpoints == null || errorEndpoint == null) {
				 throw new Exception("Set of configuration failed. Endpoint cannot be null");
			}else {
				setFlowPropertiesFromDB(flow);
			}
		   xmlConfiguration = ConvertUtil.convertDocToString(doc);
		   
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

	
	private String convertFlowConfigurationToDB(Document doc, Long connectorId, List<String> flowIds) throws Exception {
		
		for(String flowId : flowIds) {
			Long id = Long.parseLong(flowId, 10);			
			setFlowPropertiesFromXML(doc, connectorId,id);
		}
		
		String result = "ok";
		
		return result;
		
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

	    rootElement = doc.createElement("connectors");
	    doc.appendChild(rootElement);
	    
	    Element connector = doc.createElement("connector");
	    rootElement.appendChild(connector);

	    Element id = doc.createElement("id");
	    id.appendChild(doc.createTextNode(connectorId));
	    connector.appendChild(id);
	    
	    flows = doc.createElement("flows");
	    services = doc.createElement("services");
	    headers = doc.createElement("headers");
	    
	    connector.appendChild(flows);
	    connector.appendChild(services);
	    connector.appendChild(headers);
	    
	    servicesList = new ArrayList<String>();
	    headersList = new ArrayList<String>();    
		
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
				
			if(confOptions!=null && !confOptions.isEmpty()) {
				
			    Element options = doc.createElement("options");
			    endpoint.appendChild(options);
			    
			    String[] confOptionsSplitted = confOptions.split("&");
			    
			    if(confOptionsSplitted.length>1) {
			    
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
					
				if(confOptions!=null && !confOptions.isEmpty()) {
				    Element options = doc.createElement("options");
				    endpoint.appendChild(options);
				    
				    String[] confOptionsSplitted = confOptions.split("&");
				    
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
				
			if(confOptions!=null  && !confOptions.isEmpty()) {
				
			    Element options = doc.createElement("options");
			    endpoint.appendChild(options);
			    
			    String[] confOptionsSplitted = confOptions.split("&");
			    
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

		if(!servicesList.contains(serviceid)) {
			servicesList.add(serviceid);

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
	}
	
	private void setHeaderFromDB(String headerid, String type, Header headerDB) throws Exception {

		if(!headersList.contains(headerid)) {
			headersList.add(headerid);

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
	}

	private String setFlowPropertiesFromXML(Document doc, Long connectorId, Long id) throws Exception {
		
		XPath xPath = XPathFactory.newInstance().newXPath();
	    String flowId = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/id",doc);
	    String flowName = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/name",doc);
	    String flowAutostart = xPath.evaluate("//flows/flow[id='" + id.toString() + "']/autostart",doc);

	    if(!flowId.isEmpty()) {
	    	
	       Flow flow = flowRepository.findOne(id);
	       Gateway gateway = gatewayRepository.findOne(connectorId);
	       
	       if(flow==null) {
	    	   flow = new Flow();
	    	   flow.setId(id);
	       }
	       
	       if(gateway==null) {
	    	   return "unknown gateway";
	       }else {
		       flow.setGateway(gateway);
	       }
	       
	       if(flowName==null) {
	    	   flow.setName(flowId);   
	       }else {
	    	   flow.setName(flowName);
	       }
	       
	       if(flowAutostart!=null && flowAutostart.equals("true")) {
	    	   flow.setAutoStart(true);   
	       }else {
	    	   flow.setAutoStart(false);
	       }
	       
	       fromEndpoint = getFromEndpointFromXML(flowId, doc);	       
	       flow.setFromEndpoint(fromEndpoint);

	       errorEndpoint = getErrorEndpointFromXML(flowId, doc);
	       flow.setErrorEndpoint(errorEndpoint);

	       toEndpoints = getToEndpointsFromXML(flowId, doc, flow);
	       flow.toEndpoints(toEndpoints);
	       
	       flow = flowRepository.save(flow);
	       
	       return "flow imported";
	       
		}else {
			return "unknown flow id";
		}
	}

	private FromEndpoint getFromEndpointFromXML(String id, Document doc) throws Exception {
		
		XPath xPath = XPathFactory.newInstance().newXPath();
	    String fromUri = xPath.evaluate("//flows/flow[id='" + id + "']/from/uri",doc);
	    String fromServiceId = xPath.evaluate("//flows/flow[id='" + id + "']/from/service_id",doc);
	    String fromHeaderId = xPath.evaluate("//flows/flow[id='" + id + "']/from/header_id",doc);
	    String fromOptions = null;
	    
	    //get type
	    String[] fromUriSplitted = fromUri.split(":",2);
	    String fromTypeAsString = fromUriSplitted[0].toUpperCase();
	    EndpointType fromType = EndpointType.valueOf(fromTypeAsString);

	    //get uri
	    fromUri = fromUriSplitted[1];
	    while(fromUri.startsWith("/")) {
	    	fromUri = fromUri.substring(1);	
	    }	    

	    //get options
	    Map<String,String> fromOptionsMap = getMap(doc,"//flows/flow[id='\" + flowId + \"']/from/uri");
	    
	    for (Map.Entry<String, String> entry : fromOptionsMap.entrySet()) {
	    	if(fromOptions!=null) {
	    		fromOptions = fromOptions + "&";
	    	}
	        String key = entry.getKey();
	        String value = entry.getValue();
	        fromOptions = fromOptions + key + "=" + value;
	    }

	    
	    //get service if configured
	    org.assimbly.gateway.domain.Service fromService;
	    try  
		  { 
			Long serviceId = Long.parseLong(fromServiceId, 10);
		    fromService = serviceRepository.findOne(serviceId);
		  }  
		  catch(NumberFormatException nfe)  
		  { 
			fromService = null;
		  }

	    //get header if configured
	    Header fromHeader;
	    try  
		  { 
			Long headerId = Long.parseLong(fromHeaderId, 10);
		    fromHeader = headerRepository.findOne(headerId);
		  }  
		  catch(NumberFormatException nfe)  
		  { 
			  fromHeader = null;
		  }
	    
	    fromEndpoint = new FromEndpoint();
		fromEndpoint.setUri(fromUri);
		fromEndpoint.setType(fromType);
		fromEndpoint.setOptions(fromOptions);

		if(fromService!=null) {
			errorEndpoint.setService(fromService);
		}
		if(fromHeader!=null) {
			errorEndpoint.setHeader(fromHeader);
		}
		
		return fromEndpoint;
	}
	
	private Set<ToEndpoint> getToEndpointsFromXML(String id, Document doc, Flow flow) throws Exception {

		Set<ToEndpoint> toEndpoints = new HashSet<ToEndpoint>();
		
		XPath xPath = XPathFactory.newInstance().newXPath();
	    int numberOfToEndpoints = Integer.parseInt(xPath.evaluate("count(//flows/flow[id='" + id + "']/to)",doc));
	    numberOfToEndpoints = numberOfToEndpoints + 1;
	    
	    for(int index = 1; index < numberOfToEndpoints; index++) {
		    String toUri = xPath.evaluate("//flows/flow[id='" + id + "']/to[" + index + "]/uri",doc);
		    String toServiceId = xPath.evaluate("//flows/flow[id='" + id + "']/to[" + index + "]/service_id",doc);
		    String toHeaderId = xPath.evaluate("//flows/flow[id='" + id + "']/to[" + index + "]/header_id",doc);
		    String toOptions = null;
		    
		    //get type
		    String[] toUriSplitted = toUri.split(":",2);
		    String toTypeAsString = toUriSplitted[0].toUpperCase();
		    
		    EndpointType toType = EndpointType.valueOf(toTypeAsString);

		    //get uri
		    toUri = toUriSplitted[1];
		    while(toUri.startsWith("/")) {
		    	toUri = toUri.substring(1);;	
		    }	    

		    //get options
		    Map<String,String> toOptionsMap = getMap(doc,"//flows/flow[id='\" + flowId + \"']/to/uri");
		    
		    for (Map.Entry<String, String> entry : toOptionsMap.entrySet()) {
		    	if(toOptions!=null) {
		    		toOptions = toOptions + "&";
		    	}
		        String key = entry.getKey();
		        String value = entry.getValue();
		        toOptions = toOptions + key + "=" + value;
		    }		    

		    //get service if configured
		    org.assimbly.gateway.domain.Service toService;
		    try  
			  { 
				Long serviceId = Long.parseLong(toServiceId, 10);
			    toService = serviceRepository.findOne(serviceId);
			  }  
			  catch(NumberFormatException nfe)  
			  { 
				toService = null;
			  }

		    //get header if configured
		    Header toHeader;
		    try  
			  { 
				Long headerId = Long.parseLong(toHeaderId, 10);
			    toHeader = headerRepository.findOne(headerId);
			  }  
			  catch(NumberFormatException nfe)  
			  { 
				  toHeader = null;
			  }
		    
		    toEndpoint = new ToEndpoint();
			toEndpoint.setUri(toUri);
			toEndpoint.setType(toType);
			toEndpoint.setFlow(flow);
			toEndpoint.setOptions(toOptions);
		
			if(toService!=null) {
				errorEndpoint.setService(toService);
			}
			if(toHeader!=null) {
				errorEndpoint.setHeader(toHeader);
			}
			
			
			toEndpoints.add(toEndpoint);
	    }

		return toEndpoints;
	}
	
	private ErrorEndpoint getErrorEndpointFromXML(String id, Document doc) throws Exception {

		XPath xPath = XPathFactory.newInstance().newXPath();
	    String errorUri = xPath.evaluate("//flows/flow[id='" + id + "']/error/uri",doc);
	    String errorServiceId = xPath.evaluate("//flows/flow[id='" + id + "']/error/service_id",doc);
	    String errorHeaderId = xPath.evaluate("//flows/flow[id='" + id + "']/error/header_id",doc);
	    String errorOptions = null;
	    
	    //get type
	    String[] errorUriSplitted = errorUri.split(":",2);
	    String errorTypeAsString = errorUriSplitted[0].toUpperCase();
	    EndpointType errorType = EndpointType.valueOf(errorTypeAsString);

	    //get uri
	    errorUri = errorUriSplitted[1];
	    while(errorUri.startsWith("/")) {
	    	errorUri = errorUri.substring(1);	
	    }	    

	    //get options

	    Map<String,String> errorOptionsMap = getMap(doc,"//flows/flow[id='\" + flowId + \"']/error/uri");
	    
	    for (Map.Entry<String, String> entry : errorOptionsMap.entrySet()) {
	    	if(errorOptions!=null) {
	    		errorOptions = errorOptions + "&";
	    	}
	        String key = entry.getKey();
	        String value = entry.getValue();
	        errorOptions = errorOptions + key + "=" + value;
	    }
	    
	    //get service if configured
	    org.assimbly.gateway.domain.Service errorService;
	    try  
		  { 
			Long serviceId = Long.parseLong(errorServiceId, 10);
		    errorService = serviceRepository.findOne(serviceId);
		  }  
		  catch(NumberFormatException nfe)  
		  { 
			errorService = null;
		  }

	    //get header if configured
	    Header errorHeader;
	    try  
		  { 
			Long headerId = Long.parseLong(errorHeaderId, 10);
		    errorHeader = headerRepository.findOne(headerId);
		  }  
		  catch(NumberFormatException nfe)  
		  { 
			  errorHeader = null;
		  }
	    errorEndpoint = new ErrorEndpoint();
		errorEndpoint.setUri(errorUri);
		errorEndpoint.setType(errorType);
		errorEndpoint.setOptions(errorOptions);
		if(errorService!=null) {
			errorEndpoint.setService(errorService);
		}
		if(errorHeader!=null) {
			errorEndpoint.setHeader(errorHeader);
		}		
		
		return errorEndpoint;
		
	}


	private String setServicesPropertiesFromXML(Document doc, List<String> serviceIds) throws Exception {
		
		for(String serviceId : serviceIds) {
			
			try  
			  { 
			    serviceIdLong = Long.parseLong(serviceId, 10);
			    service = serviceRepository.findOne(serviceIdLong);
		
			    if(service==null) {
			    	service = new org.assimbly.gateway.domain.Service();
			    	serviceKeys = new HashSet<ServiceKeys>();
			    	service.setId(serviceIdLong);
			    	service.setName(serviceId);
			    }else {
			    	serviceKeys = service.getServiceKeys();
			    }
			  }  
			  catch(NumberFormatException nfe)  
			  { 
			      service = new org.assimbly.gateway.domain.Service();
			      serviceKeys = new HashSet<ServiceKeys>();
			      service.setName(serviceId);
			  }
			
			
			Map<String, String> serviceMap = getMap(doc, "/connectors/connector/services/service[id=" + serviceId + "]/*");
			
		    for (Map.Entry<String, String> entry : serviceMap.entrySet()) {
		    	    	
		        String key = entry.getKey();
		        String value = entry.getValue();

	          	if(key.equals("id")) {
	          		//nothing
	        	}else if(key.equals("name")) {
					service.setName(key);
				}else if(key.equals("type")) {
					service.setType(key);
				}
	        	else {
					ServiceKeys serviceKey = new ServiceKeys();
					serviceKey.setKey(key);
					serviceKey.setValue(value);
					serviceKey.setType("constant");
					serviceKey.setService(service);
					serviceKeys.add(serviceKey);
				}
		    }
		    
    		if(service!=null && serviceKeys!=null) {    			
    			service.setServiceKeys(serviceKeys);
 				serviceRepository.save(service);
    	      	service = null;
    	      	serviceKeys = null;
    		}
    		
		}
         
        return "ok";
    }
	
	private String setHeadersPropertiesFromXML(Document doc, List<String> headerIds) throws Exception {
		
		for(String headerId : headerIds) {
			
			try  
			  { 
			    headerIdLong = Long.parseLong(headerId, 10);
			    header = headerRepository.findOne(headerIdLong);
		
			    if(header==null) {
			    	header = new Header();
			    	headerKeys = new HashSet<HeaderKeys>();
			    	header.setId(headerIdLong);
			    	header.setName(headerId);
			    }else {
			    	headerKeys = header.getHeaderKeys();
			    }
			  }  
			  catch(NumberFormatException nfe)  
			  { 
			      header = new Header();
			      headerKeys = new HashSet<HeaderKeys>();
			      header.setName(headerId);
			  }
			

	        // Create XPath object
	        XPathFactory xpathFactory = XPathFactory.newInstance();
	        XPath xpath = xpathFactory.newXPath();
	        XPathExpression expr = xpath.compile("/connectors/connector/headers/header[id=" + headerId + "]/*");
	    	
	        NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
	        for (int i = 0; i < nodes.getLength(); i++) {
	        	
	        	String key = nodes.item(i).getNodeName();
	        	String value = nodes.item(i).getTextContent();
	        	Node headerKeyType = nodes.item(i).getAttributes().getNamedItem("type");
	        	String type = "constant";
	        	
	        	if(headerKeyType!=null) {
					type = headerKeyType.getTextContent();
				}

	          	if(key.equals("id")) {
	          		//nothing
	        	}else if(key.equals("name")) {
					header.setName(key);
				}else {
					
					HeaderKeys headerKey = new HeaderKeys();
					headerKey.setKey(key);
					headerKey.setValue(value);
					headerKey.setType(type);
					headerKey.setHeader(header);
					headerKeys.add(headerKey);
				}
	        	
	        }
		    
    		if(header!=null && headerKeys!=null) {    			
    			header.setHeaderKeys(headerKeys);
 				headerRepository.save(header);
    	      	header = null;
    	      	headerKeys = null;
    		}
    		
		}
         
        return "ok";
		
	}
	
    private static List<String> getList(Document doc, String input)  throws Exception {

        // Create XPath object
        XPathFactory xpathFactory = XPathFactory.newInstance();
        XPath xpath = xpathFactory.newXPath();
        XPathExpression expr = xpath.compile(input);
    	
        // Create list of Ids
    	List<String> list = new ArrayList<>();
        NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
        for (int i = 0; i < nodes.getLength(); i++) {
            list.add(nodes.item(i).getNodeValue());
        }
        
        return list;
    }

	private List<String> getListFromFlow(Document doc, Long id, String type) throws XPathExpressionException {

        // Create list
    	List<String> list = new ArrayList<>();

		// Create XPath object
        XPathFactory xpathFactory = XPathFactory.newInstance();
        XPath xpath = xpathFactory.newXPath();
        
        String fromId = xpath.evaluate("/connectors/connector/flows/flow[id=" + id.toString() +"]/from/" + type + "_id",doc);
        
        if(fromId!=null && !fromId.isEmpty()) {
        	list.add(fromId);
        }

        String errorId = xpath.evaluate("/connectors/connector/flows/flow[id=" + id.toString() +"]/error/" + type + "_id",doc);

        if(errorId!=null && !errorId.isEmpty()) {
        	list.add(errorId);
        }
        
        XPathExpression expr = xpath.compile("/connectors/connector/flows/flow[id=" + id.toString() +"]/to/" + type + "_id/text()");
        NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
        for (int i = 0; i < nodes.getLength(); i++) {
        	list.add(nodes.item(i).getNodeValue());
        }
        
        //remove duplicates
        list = new ArrayList<>(new HashSet<>(list));
        
        return list;
	}

    
    
    private static Map<String, String> getMap(Document doc, String input)  throws Exception {

        // Create XPath object
        XPathFactory xpathFactory = XPathFactory.newInstance();
        XPath xpath = xpathFactory.newXPath();
        XPathExpression expr = xpath.compile(input);
    	
        // Create list of Ids
    	Map <String, String> map = new HashMap<String, String>();
        NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
        for (int i = 0; i < nodes.getLength(); i++) {
        	map.put(nodes.item(i).getNodeName(),nodes.item(i).getTextContent());
        }
        
        return map;
    }	
	
}
