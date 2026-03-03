package org.assimbly.gateway.config.exporting;

import org.apache.commons.lang3.StringUtils;
import org.apache.xerces.dom.DocumentImpl;
import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.repository.RouteRepository;
import org.assimbly.util.IntegrationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.*;

@Service
@Transactional
public class ExportXML {

    private final Logger log = LoggerFactory.getLogger(ExportXML.class);

    private final ApplicationProperties applicationProperties;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private EnvironmentVariablesRepository environmentVariablesRepository;

    private String xmlConfiguration;

    private Document doc;

    private Set<Step> stepsDB;

    private Node environmentVariablesList;

    private Element flows;
    private Element connections;
    private Element messages;
    private Element routes;
    private Element routeConfigurations;
    private Element flow;

    private String integrationId;
    private String routeConfigurationId;
    private String logLevelAsString = "OFF";
    private String flowTypeAsString;
    private String flowNameAsString;

    private List<String> connectionsList;
    private List<String> messagesList;
    private List<String> routesList;


    public ExportXML(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public String getXMLConfiguration(Long integrationId) throws Exception {

        setGeneralProperties(integrationId);

        List<Flow> flows = flowRepository.findAllByIntegrationId(integrationId);

        for (Flow flow : flows) {
            if (flow != null) {
                getXMLFlowConfiguration(flow);
            }
        }

        xmlConfiguration = DocConverter.convertDocToString(doc);

        return xmlConfiguration;
    }

    public String getXMLConfigurationByIds(Long integrationId, String ids) throws Exception {

        setGeneralProperties(integrationId);

        List<String> idsList = Arrays.asList(ids.split(","));

        List<Flow> flows = flowRepository.findAllByIntegrationId(integrationId);

        for (Flow flow : flows) {
            if (flow != null) {

                String confId = Long.toString(flow.getId());

                if(idsList.contains(confId)) {
                    getXMLFlowConfiguration(flow);
                }
            }
        }

        xmlConfiguration = DocConverter.convertDocToString(doc);

        return xmlConfiguration;
    }


    public String getXMLFlowConfiguration(Long id) throws Exception {

        Optional<Flow> flowOptional = flowRepository.findById(id);

        if (flowOptional.isPresent()) {

            Flow flow = flowOptional.get();

            if (flow.getIntegration() == null) {
                throw new IllegalStateException("Flow " + flow.getId() + " has no integration assigned");
            }

            setGeneralProperties(flow.getIntegration().getId());

            // check if steps are configured
            stepsDB = flow.getSteps();

            if (stepsDB == null) {
                throw new Exception("Set of configuration failed. Step cannot be null");
            } else {
                setFlows(flow);
            }

        }

        xmlConfiguration = DocConverter.convertDocToString(doc);

        xmlConfiguration = StringUtils.substringBeforeLast(xmlConfiguration,"</dil>") + "</dil>";

        return xmlConfiguration;
    }

    public String getXMLFlowConfiguration(Flow flow) throws Exception {

        stepsDB = flow.getSteps();

        if (stepsDB == null) {
            throw new Exception("Set of configuration failed. Step cannot be null");
        } else {
            setFlows(flow);
        }

        xmlConfiguration = DocConverter.convertDocToString(doc);

        return xmlConfiguration;

    }


    // set methods
    // These methods set the XML Elements

    public void setGeneralProperties(Long integrationIdLong) throws Exception {

        integrationId = integrationIdLong.toString();
        Integration integration = integrationRepository.findById(integrationIdLong).get();

        doc = new DocumentImpl();

        Element dil = doc.createElement("dil");
        doc.appendChild(dil);

        setElement("version", applicationProperties.getInfo().getVersion(), dil);
        Element integrations = setElement("integrations", null, dil);
        Element core = setElement("core", null, dil);

        setIntegrations(integrations, integration);

        setCore(core);

    }

    public void setIntegrations(Element integrations, Integration integration) {

        Element integrationElement = setElement("integration", null, integrations);

        setElement("id", integrationId, integrationElement);
        setElement("name", integration.getName(), integrationElement);
        setElement("type", integration.getType().toString(), integrationElement);

        //Options
        Element options =  setElement("options", null, integrationElement);

        setElement("environment", integration.getEnvironmentName(), options);
        setElement("stage", integration.getStage().toString(), options);
        setElement("defaultFromComponentType", integration.getDefaultFromComponentType(), options);
        setElement("defaultToComponentType", integration.getDefaultToComponentType(), options);
        setElement("defaultErrorComponentType", integration.getDefaultErrorComponentType(), options);

        flows = setElement("flows", null, integrationElement);

    }

    public void setFlows(Flow flowDB) throws Exception {

        flow = setElement("flow", null, flows);

        //general
        setElement("id", flowDB.getId().toString(), flow);
        setElement("name", flowDB.getName(), flow);
        setElement("type", flowDB.getType(), flow);
        setElement("version", flowDB.getVersion().toString(), flow);

        //options
        Element options =  setElement("options", null, flow);

        setElement("created", flowDB.getCreated().toString(), options);
        setElement("lastModified", flowDB.getLastModified().toString(), options);
        setElement("autostart", flowDB.isAutoStart().toString(), options);
        setElement("logLevel", flowDB.getLogLevel().toString(), options);
        setElement("failureProcessor", "true", options);

        flowNameAsString = flowDB.getName();
        flowTypeAsString = flowDB.getType();
        logLevelAsString = flowDB.getLogLevel().toString();

        //notes
        String flowNotes = flowDB.getNotes();
        if(flowNotes!=null){
            setElement("notes", flowNotes, flow);
        }

        // set components
        setDependencies(stepsDB);

        // set steps
        setSteps(stepsDB);

    }

    public void setDependencies(Set<Step> stepsDB) {

        Set<String> dependenciesList = new HashSet<>();

        Element dependencies =  setElement("dependencies", null, flow);

        for (Step stepDB : stepsDB) {

            String dependency = stepDB.getComponentType();

            if(!dependenciesList.contains(dependency)){
                dependenciesList.add(dependency);
                setElement("dependency", dependency, dependencies);
            }
        }
    }

    public void setSteps(Set<Step> stepsDB) throws Exception {

        Element steps = setElement("steps", null, flow);

        for (Step stepDB : stepsDB) {
            if(stepDB.getStepType().getStep().equalsIgnoreCase("error")){
                setStep(steps, stepDB);
            }
        }

        for (Step stepDB : stepsDB) {
            if(!stepDB.getStepType().getStep().equalsIgnoreCase("error")){
                setStep(steps, stepDB);
            }
        }

    }

    public void setStep(Element steps, Step stepDB) throws Exception {

        String confId = Long.toString(stepDB.getId());
        String confUri = stepDB.getUri();
        String confStepType = stepDB.getStepType().getStep();
        String confComponentType = stepDB.getComponentType();
        String confOptions = stepDB.getOptions();
        Message confMessage = stepDB.getMessage();

        Element step = setElement("step", null, steps);

        setElement("id", confId, step);
        setElement("type", confStepType, step);

        confUri = createUri(confUri, confComponentType, confMessage);
        setElement("uri", confUri, step);

        if (confOptions != null && !confOptions.isEmpty()) {
            Element options =  setElement("options", null, step);

            String[] confOptionsSplitted = confOptions.split("&");

            for (String confOption : confOptionsSplitted) {
                String confOptionKey = confOption.split("=")[0];
                String confOptionValue = StringUtils.substringAfter(confOption, "=");

                setElement(confOptionKey, confOptionValue, options);
            }
        }

        setBlocks(confId, stepDB, step);

        setLinks(stepDB, step);

    }

    public void setBlocks(String confId, Step stepDB, Element step) throws Exception {

        Element blocks = setElement("blocks", null, step);

        String stepId = Long.toString(stepDB.getId());
        Integer confRouteId = stepDB.getRouteId();
        Connection confConnection = stepDB.getConnection();
        Message confMessage = stepDB.getMessage();
        Integer confResponseId = stepDB.getResponseId();

        Element block;

        if (confRouteId != null) {

            Optional<Route> routeOptional = getRoute(confRouteId);

            if(routeOptional.isPresent()) {

                block = setElement("block", null, blocks);
                Route route = routeOptional.get();
                String routeContent = route.getContent();

                if(routeContent.startsWith("<routeConfiguration")) {
                    setElement("id", stepId, block);
                    setElement("type", "routeconfiguration", block);
                }else{
                    setElement("id", stepId, block);
                    setElement("type", "route", block);
                }
            }

            setRoute(confRouteId, confId);

        }

        if (confConnection != null) {
            block = setElement("block", null, blocks);
            String confConnectionId = confConnection.getId().toString();
            setElement("id", confConnectionId, block);
            setElement("type", "connection", block);

            setConnection(confConnectionId, confConnection);
        }

        if (confMessage != null) {
            block = setElement("block", null, blocks);
            String confMessageId = confMessage.getId().toString();
            setElement("id", confMessageId, block);
            setElement("type", "message", block);

            setMessage(confMessageId, confMessage, stepDB);
        }

        if (confResponseId != null) {
            block = setElement("block", null, blocks);
            setElement("id", Integer.toString(confResponseId), block);
            setElement("response", "response", block);
        }

        if(confRouteId == null && confConnection == null && confMessage == null && confResponseId == null) {
            step.removeChild(blocks);
        }

    }

    public void setLinks(Step stepDB, Element step) {

        Set<Link> confLinks = stepDB.getLinks();

        if(!confLinks.isEmpty()){
            Element links = setElement("links", null, step);

            for(Link confLink: confLinks){
                Element link = setElement("link", null, links);
                setElement("id", confLink.getName(), link);
                setElement("transport", confLink.getTransport(), link);
                setElement("bound", confLink.getBound(), link);
            }

        }

    }


    public void setCore(Element core) throws Exception {
        connections = setElement("connections", null, core);
        messages = setElement("messages", null, core);
        routes = setElement("routes", null, core);
        routeConfigurations = setElement("routeConfigurations", null, core);
        environmentVariablesList = setElement("environmentVariables", null, core);

        connectionsList = new ArrayList<>();
        messagesList = new ArrayList<>();
        routesList = new  ArrayList<>();

        setEnvironmentVariables();

    }

    public Optional<Route> getRoute(Integer routeId){

        Long routeIdAsLong = routeId.longValue();

        return routeRepository.findById(routeIdAsLong);

    }
    public void setRoute(Integer routeid, String stepId) throws Exception {

        String routeIdAsString = routeid.toString();

        Optional<Route> routeOptional = getRoute(routeid);

        if(routeOptional.isPresent()) {

            Route route = routeOptional.get();

            if (!routesList.contains(routeIdAsString)) {

                routesList.add(stepId);

                String routeContent = route.getContent();

                routeContent = routeContent.replace("&","&amp;");

                routeContent = createLogLines(routeContent);

                if(IntegrationUtil.isXML(routeContent)){
                    Document routeDocument = getRouteDocument(routeContent, stepId);
                    Node node = doc.importNode(routeDocument.getDocumentElement(), true);
                    if(routeContent.startsWith("<routeConfiguration")){
                        routeConfigurations.appendChild(node);
                    }else{
                        routes.appendChild(node);
                        System.out.println("append the node");
                    }
                }else{
                    log.error("Route content is not valid XML:\n\n" + routeContent);
                }

            }
        }

    }

    public void setConnection(String connectionid, Connection connectionDB) {

        if (!connectionsList.contains(connectionid)) {

            connectionsList.add(connectionid);

            Element connection =  setElement("connection", null, connections);

            setElement("id", connectionDB.getId().toString(), connection);

            setElement("name", connectionDB.getName(), connection);

            setElement("type", connectionDB.getType(), connection);

            Element keys =  setElement("keys", null, connection);

            Set<ConnectionKeys> connectionKeys = connectionDB.getConnectionKeys();

            for (ConnectionKeys connectionKey : connectionKeys) {

                String parameterName = connectionKey.getKey();
                String parameterValue = connectionKey.getValue();

                setElement(parameterName, parameterValue, keys);

            }

        }

    }

    public void setMessage(String messageId, Message messageDB, Step stepDB) throws Exception {

        if (!messagesList.contains(messageId)) {
            messagesList.add(messageId);

            Element message =  setElement("message", null, messages);

            setElement("id", messageDB.getId().toString(), message);

            setElement("name", messageDB.getName(), message);

            if(stepDB.getComponentType().equalsIgnoreCase("setmessage")){
                setElement("body", stepDB.getUri(), message);
            }


            Element keys =  setElement("headers", null, message);

            Set<Header> headers = messageDB.getHeaders();

            for (Header header : headers) {

                String parameterName = header.getKey();
                String parameterValue = header.getValue();
                String parameterType = header.getType();
                String parameterLanguage = header.getLanguage();

                Element headerParameter = doc.createElement(parameterName);
                headerParameter.setTextContent(parameterValue);
                headerParameter.setAttribute("type", parameterType);
                headerParameter.setAttribute("language", parameterLanguage);
                keys.appendChild(headerParameter);
            }
        }
    }

    private Document getRouteDocument(String route, String routeId) throws Exception {

        DocumentBuilderFactory dbFactory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = dbFactory.newDocumentBuilder();
        Document routeDocument = builder.parse(new ByteArrayInputStream(route.getBytes()));


        //update the routeConfiguration ID
        NodeList nodes = routeDocument.getElementsByTagName("routeConfiguration");
        for (int idx = 0; idx < nodes.getLength(); idx++) {
            Node node = nodes.item(idx);
            ((Element)node).setAttribute("id",routeId);

            //set routeConfigurationId to be used when setting routes (this must be set before setting other route steps)
            routeConfigurationId = routeId;
        }

        //update the route ID
        nodes = routeDocument.getElementsByTagName("route");
        for (int idx = 0; idx < nodes.getLength(); idx++) {
            Node node = nodes.item(idx);
            ((Element)node).setAttribute("id",routeId);
            if(routeConfigurationId!=null){
                ((Element)node).setAttribute("routeConfigurationId",routeConfigurationId);
            }
        }


        return routeDocument;

    }

    public void setEnvironmentVariables() throws Exception {

        List<EnvironmentVariables> environmentVariables = environmentVariablesRepository.findAll();

        if (!environmentVariables.isEmpty()) {

            for (EnvironmentVariables environmentVariable : environmentVariables) {

                Element environmentVariableNode = doc.createElement("environmentVariable");
                environmentVariablesList.appendChild(environmentVariableNode);

                setElement("key", environmentVariable.getKey(), environmentVariableNode);
                setElement("value", environmentVariable.getValue(), environmentVariableNode);
                setElement("encrypted", environmentVariable.isEncrypted().toString(), environmentVariableNode);

            }
        }

    }

    public String createUri(String confUri, String confComponentType, Message confMessage) {

        String componentType = confComponentType.toLowerCase();

        componentType = setDefaultComponentType(componentType);

        if ((componentType.startsWith("setheaders") || componentType.startsWith("setmessage")) && (confUri==null || !confUri.startsWith("message"))) {
                confUri = "message:" + confMessage.getId().toString();
            }


        if(confUri!=null) {
            confUri = componentType + confUri;
        }else if(componentType.endsWith(":")){
            confUri = StringUtils.substringBeforeLast(componentType,":");
        }else{
            confUri = componentType;
        }

        if(confComponentType.startsWith("wastebin")) {
            confUri = "mock:wastebin";
        }

        return confUri;
    }

    private String createLogLines(String route){

        if(!logLevelAsString.equalsIgnoreCase("OFF") && flowTypeAsString.equalsIgnoreCase("ESB")){
            String logLine = "<to uri=\"log:" + flowNameAsString + "?showAll=true&amp;multiline=true&amp;level=" + logLevelAsString + "\"/>";

            route = route.replace("<from(.*)/>", "<from$1/>\n" + logLine);
            route = route.replace("</route>", logLine + "\n</route>");
        }

        return route;

    }


    private String setDefaultComponentType(String componentType) {

        if (componentType.equals("file") || componentType.equals("ftp") || componentType.equals("sftp")	|| componentType.equals("ftps")) {
            componentType = componentType + "://";
        } else if(!componentType.isEmpty()) {
            componentType = componentType + ":";
        }

        return componentType;
    }

    private Element setElement(String elementName, String elementValue, Element parent){

        Element element = doc.createElement(elementName);
        if(elementValue != null){
            element.setTextContent(elementValue);
        }

        parent.appendChild(element);

        return element;

    }

}
