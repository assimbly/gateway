package org.assimbly.gateway.config.importing;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.util.*;

@Service
@Transactional
public class ImportXMLServices {

    private final Logger log = LoggerFactory.getLogger(ImportXMLServices.class);

	@Autowired
	private ServiceRepository serviceRepository;

	private org.assimbly.gateway.domain.Service service;
    private Map<String, String> servicesIdMap;

	public String xmlConfiguration;
    public String configuration;

	private Set<ServiceKeys> serviceKeys;

	public String setServicesFromXML(Document doc) throws Exception {

        log.info("Importing services");

        List<String> serviceIds = ImportXMLUtil.getList(doc, "/integrations/integration/services/service/id/text()");
		XPath xPath = XPathFactory.newInstance().newXPath();

        servicesIdMap = new HashMap<String, String>();

		for (String serviceId : serviceIds) {
			setServiceFromXml(doc, serviceId);
		}

        for (Map.Entry<String, String> entry : servicesIdMap.entrySet()) {
			updateServiceIdsFromXml(doc, entry);
        }

        NodeList servicesIdNodes = (NodeList) xPath.compile("/integrations/integration/flows/flow/*/*/service_id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < servicesIdNodes.getLength(); i++) {
            String updateId =  servicesIdNodes.item(i).getTextContent();
            servicesIdNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        NodeList servicesNodes = (NodeList) xPath.compile("/integrations/integration/services/*/id").evaluate(doc, XPathConstants.NODESET);

        for (int i = 0; i < servicesNodes.getLength(); i++) {
            String updateId =  servicesNodes.item(i).getTextContent();
            servicesNodes.item(i).setTextContent(updateId.replace("id",""));
        }

        log.info("Importing services finished");

        return "ok";
	}

	public void setServiceFromXml(Document doc, String serviceId) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String serviceName = xPath.evaluate("/integrations/integration/services/service[id='" + serviceId + "']/name",doc);
		String serviceType = xPath.evaluate("/integrations/integration/services/service[id='" + serviceId + "']/type",doc);

		log.info("Start importing service: " + serviceName);

		try {
			Optional<org.assimbly.gateway.domain.Service> serviceOptional = serviceRepository.findByName(serviceName);

			if(!serviceOptional.isPresent()) {

                log.debug("Create new service: " + serviceName);

                service = new org.assimbly.gateway.domain.Service();
				serviceKeys = new HashSet<ServiceKeys>();
				service.setId(null);
				service.setName(serviceName);
				service.setType(serviceType);
			} else {
                log.debug("Update service: " + serviceName);
				service = serviceOptional.get();
				if (serviceName != null) {
					service.setName(serviceName);
				} else {
					service.setName(serviceId);
				}
				service.setType(serviceType);

                serviceKeys = service.getServiceKeys();

			}
		} catch (NumberFormatException nfe) {
			service = new org.assimbly.gateway.domain.Service();
			serviceKeys = new HashSet<ServiceKeys>();
			if (serviceName != null) {
				service.setName(serviceName);
			} else {
				service.setName(serviceId);
			}
			service.setType(serviceType);

		}

        log.debug("Get Service Keys: " + serviceName);

        Map<String, String> serviceMap = ImportXMLUtil.getMap(doc,"/integrations/integration/services/service[id='" + serviceId + "']/keys/*");
		Map<String, ServiceKeys> map = new HashMap<>();
		for (ServiceKeys s : serviceKeys) {
			map.put(s.getKey(), s);
		}

        log.debug("Set Service Keys: " + serviceName);

        for (Map.Entry<String, String> entry : serviceMap.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			ServiceKeys serviceKey;

			if (key.equals("type")) {
				service.setType(key);
			} else if (map.containsKey(key)) {
				serviceKey = map.get(key);
				serviceKey.setKey(key);
				serviceKey.setValue(value);
				serviceKeys.add(serviceKey);

			} else {
				serviceKey = new ServiceKeys();
				serviceKey.setKey(key);
				serviceKey.setValue(value);
				serviceKey.setType("constant");
				serviceKey.setService(service);
				serviceKeys.add(serviceKey);
			}
		}


        if (service != null && serviceKeys != null) {

            log.debug("Import into database: " + serviceName);

            service = serviceRepository.save(service);

			//save servicekeys
			service.setServiceKeys(serviceKeys);
			service = serviceRepository.save(service);

			String generatedServiceId = service.getId().toString();

			servicesIdMap.put(serviceId, generatedServiceId);

			service = null;
			serviceKeys = null;
		}

        log.info("Finish importing service: " + serviceName);

    }

	public void updateServiceIdsFromXml(Document doc, Map.Entry<String, String> entry) throws Exception {

		XPathFactory xpathFactory = XPathFactory.newInstance();
		XPath xPath = xpathFactory.newXPath();

		String serviceId = entry.getKey();
		String generatedServiceId= entry.getValue();

        log.debug("Update Service ID: " + serviceId + ". New Service ID: " + generatedServiceId);

		//update service_id to generated service_id
		if(!serviceId.equals(generatedServiceId)) {

			NodeList servicesIdNodes = (NodeList) xPath.compile("/integrations/integration/flows/flow/*/*[service_id='" + serviceId + "']/service_id").evaluate(doc, XPathConstants.NODESET);

			for (int i = 0; i < servicesIdNodes.getLength(); i++) {
				servicesIdNodes.item(i).setTextContent("id" + generatedServiceId);
			}

			NodeList servicesNodes = (NodeList) xPath.compile("/integrations/integration/services/service[id='" + serviceId + "']/id").evaluate(doc, XPathConstants.NODESET);

			servicesNodes.item(0).setTextContent("id" + generatedServiceId);

		}

	}

}
