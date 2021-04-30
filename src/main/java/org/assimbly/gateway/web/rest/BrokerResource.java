package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.config.environment.BrokerManager;
import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.BrokerDTO;

import io.github.jhipster.web.util.ResponseUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.annotation.PostConstruct;

/**
 * REST controller for managing Broker.
 */
@RestController
@RequestMapping("/api")
public class BrokerResource {

    private final Logger log = LoggerFactory.getLogger(BrokerResource.class);

    private static final String ENTITY_NAME = "broker";

    private final BrokerService brokerService;

	private BrokerManager brokermanager = new BrokerManager();
    private String result;

    public BrokerResource(BrokerService brokerService) {
        this.brokerService = brokerService;
    }

    /**
     * POST  /brokers : Create a new broker.
     *
     * @param brokerDTO the brokerDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new brokerDTO, or with status 400 (Bad Request) if the broker has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/brokers")
    public ResponseEntity<BrokerDTO> createBroker(@RequestBody BrokerDTO brokerDTO) throws URISyntaxException {
        log.debug("REST request to save Broker : {}", brokerDTO);
        if (brokerDTO.getId() != null) {
            throw new BadRequestAlertException("A new broker cannot already have an ID", ENTITY_NAME, "idexists");
        }
        BrokerDTO result = brokerService.save(brokerDTO);
        return ResponseEntity.created(new URI("/api/brokers/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /brokers : Updates an existing broker.
     *
     * @param brokerDTO the brokerDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated brokerDTO,
     * or with status 400 (Bad Request) if the brokerDTO is not valid,
     * or with status 500 (Internal Server Error) if the brokerDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/brokers")
    public ResponseEntity<BrokerDTO> updateBroker(@RequestBody BrokerDTO brokerDTO) throws URISyntaxException {
        log.debug("REST request to update Broker : {}", brokerDTO);
        if (brokerDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        BrokerDTO result = brokerService.save(brokerDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, brokerDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /brokers : get all the brokers.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of brokers in body
     */
    @GetMapping("/brokers")
    public List<BrokerDTO> getAllBrokers() {
        log.debug("REST request to get all Brokers");
        return brokerService.findAll();
    }

    /**
     * GET  /brokers/:id : get the "id" broker.
     *
     * @param id the id of the brokerDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the brokerDTO, or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}")
    public ResponseEntity<BrokerDTO> getBroker(@PathVariable Long id) {
        log.debug("REST request to get Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        return ResponseUtil.wrapOrNotFound(brokerDTO);

    }

    /**
     * POST  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param queueName, the name of the queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @PostMapping("/brokers/{brokerType}/queue/{queueName}")
    public void createQueue(@PathVariable String brokerType, @PathVariable String queueName) {

        log.debug("REST request to get create queue : {}", queueName);

        try {
            brokermanager.createQueue(brokerType,queueName);
        } catch (Exception e1) {
            log.error("Can't create queue", e1);
        }
    }

    /**
     * POST  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param queueName, the name of the queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @DeleteMapping("/brokers/{brokerType}/queue/{queueName}")
    public void deleteQueue(@PathVariable String brokerType, @PathVariable String queueName) {

        log.debug("REST request to get delete queue : {}", queueName);

        try {
            brokermanager.deleteQueue(brokerType,queueName);
        } catch (Exception e1) {
            log.error("Can't delete queue", e1);
        }
    }

    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param queueName, the name of the queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{brokerType}/queue/{queueName}")
    public String getQueue(@PathVariable String brokerType, @PathVariable String queueName) {

        log.debug("REST request to get get queue : {}", queueName);

        try {
           result = brokermanager.getQueue(brokerType,queueName);
        } catch (Exception e1) {
            log.error("Can't get queue", e1);
        }

        return result;

    }


    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{brokerType}/queues")
    public String getQueues(@PathVariable String brokerType) {

        log.debug("REST request to get get queues : {}");

        try {
            result = brokermanager.getQueues(brokerType);
        } catch (Exception e1) {
            log.error("Can't get queue", e1);
        }

        return result;
    }

    /**
     * POST  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param queueName, the name of the queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @PostMapping("/brokers/{brokerType}/queue/{queueName}/clear")
    public void clearQueue(@PathVariable String brokerType, @PathVariable String queueName) {

        log.debug("REST request to get clear queue : {}", queueName);

        try {
            brokermanager.clearQueue(brokerType,queueName);
        } catch (Exception e1) {
            log.error("Can't create queue", e1);
        }
    }

    /**
     * POST  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param queueName, the name of the queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @PostMapping("/brokers/{brokerType}/queues/clear")
    public void clearQueues(@PathVariable String brokerType, @PathVariable String queueName) {

        log.debug("REST request to get create queue : {}", queueName);

        try {
            brokermanager.clearQueues(brokerType);
        } catch (Exception e1) {
            log.error("Can't create queue", e1);
        }
    }

    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{brokerType}/connections")
    public String getConnections(@PathVariable String brokerType) {

        log.debug("REST request to get get connections : {}");

        try {
            result = brokermanager.getConnections(brokerType);
        } catch (Exception e1) {
            log.error("Can't get connections", e1);
        }

        return result;
    }

    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{brokerType}/consumers")
    public String getConsumers(@PathVariable String brokerType) {

        log.debug("REST request to get get consumers : {}");

        try {
            result = brokermanager.getConsumers(brokerType);
        } catch (Exception e1) {
            log.error("Can't get consumers", e1);
        }

        return result;
    }

    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param queueName, the name of the queue
     * @param filter, the filter
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{brokerType}/messages/{queueName}/{filter}")
    public String listMessages(@PathVariable String brokerType, @PathVariable String queueName, @PathVariable String filter) {

        log.debug("REST request to list messages for queue : {}", queueName);

        try {
            return brokermanager.listMessages(brokerType,queueName, filter);
        } catch (Exception e1) {
            log.error("Can't list messages", e1);
        }

        return "failed";
    }

    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param endpointName, the name of the queue
     * @param filter, the filter
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{brokerType}/message/{endpointName}/browse/{messageId}")
    public String browseMessage(@PathVariable String brokerType, @PathVariable String endpointName, @PathVariable String messageId) {

        log.debug("REST request to browse message on: {}", endpointName);

        try {
            return brokermanager.browseMessage(brokerType,endpointName, messageId);
        } catch (Exception e1) {
            log.error("Can't browse message", e1);
        }

        return "failed";
    }

    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param endpointName, the name of the queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{brokerType}/messages/{endpointName}/browse")
    public String browseMessages(@PathVariable String brokerType, @PathVariable String endpointName) {

        log.debug("REST request to browse messages on: {}", endpointName);

        try {
            return brokermanager.browseMessages(brokerType,endpointName);
        } catch (Exception e1) {
            log.error("Can't browse messages", e1);
        }

        return "failed";
    }


    /**
     * POST  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param endpointName, the name of the endpoint (queue or topic)
     * @param messageHeaders, the message headers
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @PostMapping("/brokers/{brokerType}/message/{endpointName}/send/{messageHeaders}")
    public String sendMessage(@PathVariable String brokerType, @PathVariable String endpointName, @PathVariable Map<String,String> messageHeaders, @RequestBody String messageBody) {

        log.debug("REST request to send messages from queue : " + endpointName);

        try {
            return brokermanager.sendMessage(brokerType,endpointName,messageHeaders,messageBody);
        } catch (Exception e1) {
            log.error("Can't send message", e1);
        }

        return "success";
    }


    /**
     * DELETE  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param queueName, the name of the queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @DeleteMapping("/brokers/{brokerType}/message/{queueName}/{messageId}")
    public String removeMessage(@PathVariable String brokerType, @PathVariable String queueName, int messageId) {

        log.debug("REST request to remove messages for queue : {}", queueName);

        try {
            return brokermanager.removeMessage(brokerType,queueName, messageId);
        } catch (Exception e1) {
            log.error("Can't create queue", e1);
        }

        return "success";
    }

    /**
     * DELETE  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param queueName, the name of the queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @DeleteMapping("/brokers/{brokerType}/messages/{queueName}")
    public String removeMessages(@PathVariable String brokerType, @PathVariable String queueName) {

        log.debug("REST request to remove messages for queue : {}", queueName);

        try {
            return brokermanager.removeMessages(brokerType,queueName);
        } catch (Exception e1) {
            log.error("Can't create queue", e1);
        }

        return "success";
    }

    /**
     * POST  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param sourceQueueName, the name of the source queue
     * @param targetQueueName, the name of the target queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @PostMapping("/brokers/{brokerType}/message/{sourceQueueName}/{targetQueueName}/{messageId}")
    public String moveMessage(@PathVariable String brokerType, @PathVariable String sourceQueueName, @PathVariable String targetQueueName, String messageId) {

        log.debug("REST request to move messages from queue : " + sourceQueueName + " to " + targetQueueName);

        try {
            return brokermanager.moveMessage(brokerType,sourceQueueName, targetQueueName, messageId);
        } catch (Exception e1) {
            log.error("Can't create queue", e1);
        }

        return "success";
    }

    /**
     * POST  /brokers/:id : get the broker status by "id".
     *
     * @param brokerType, the type of broker: classic or artemis
     * @param sourceQueueName, the name of the source queue
     * @param targetQueueName, the name of the target queue
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @PostMapping("/brokers/{brokerType}/messages/{sourceQueueName}/{targetQueueName}")
    public String moveMessages(@PathVariable String brokerType, @PathVariable String sourceQueueName, @PathVariable String targetQueueName) {

        log.debug("REST request to move messages from queue : " + sourceQueueName + " to " + targetQueueName);

        try {
            return brokermanager.moveMessages(brokerType,sourceQueueName, targetQueueName);
        } catch (Exception e1) {
            log.error("Can't move messages", e1);
        }

        return "success";
    }


    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param id, the id of the broker to retrieve
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/status")
    public String statusBroker(@PathVariable Long id) {
        log.debug("REST request to get status of Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();

        String status = "stopped";

        try {
            status = brokermanager.getStatus(brokerType);
        } catch (Exception e1) {
            log.error("Can't get status", e1);
        }

        return status;
    }


    /**
     * GET  /brokers/:id : get the broker info by "id".
     *
     * @param id, the id of the broker to retrieve
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/info")
    public String infoBroker(@PathVariable Long id) {
        log.debug("REST request to get status of Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();

        String info = "unknown";

        try {
            info = brokermanager.getInfo(brokerType);
        } catch (Exception e1) {
            log.error("Can't get status", e1);
        }

        return info;
    }

    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param id the id of the brokerDTO to retrieve
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/getconfiguration")
    public String getConfigurationBroker(@PathVariable Long id) {
        log.debug("REST request to get configuration of Broker : {}");
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();

        String configuration = "unknown";

        try {
            configuration = brokermanager.getConfiguration(brokerType);
        } catch (Exception e1) {
            log.error("Can't get status", e1);
        }

        return configuration;
    }


    /**
     * POST  /brokers/:id : set the broker configuration by "id" and "configurationFile".
     *
     * @param id the id of the brokerDTO to retrieve
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     * @throws Exception
     */
    @PostMapping(path = "/brokers/{id}/setconfiguration")
    public ResponseEntity<String> setConfigurationBroker(@PathVariable Long id, @RequestBody(required = false) String brokerConfiguration) throws Exception {
        log.debug("REST request to set configuration of Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();
        String brokerConfigurationType = brokerDTO.get().getConfigurationType();

       	try {
       		String result = brokermanager.setConfiguration(brokerType,brokerConfigurationType, brokerConfiguration);
            if(result.equals("configuration set")) {
            	System.out.println("result succes: " + result);
            	return org.assimbly.gateway.web.rest.util.ResponseUtil.createSuccessResponse(id, "text", "setConfiguration", result);
            }else {
            	System.out.println("result failed: " + result);
            	return org.assimbly.gateway.web.rest.util.ResponseUtil.createFailureResponse(id, "text", "setConfiguration", result);
            }
   		} catch (Exception e) {
   			System.out.println("result failed 2: " + e.getMessage());
   			return org.assimbly.gateway.web.rest.util.ResponseUtil.createFailureResponse(id, "text", "setConfiguration", e.getMessage());
   		}

    }

    /**
     * GET  /brokers/:id : start the broker by "id".
     *
     * @param id the id of the brokerDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the brokerDTO, or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/start")
    public ResponseEntity<BrokerDTO> startBroker(@PathVariable Long id) {
        log.debug("REST request to start Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();
        String brokerConfigurationType = brokerDTO.get().getConfigurationType();

        try {
   			brokermanager.start(brokerType,brokerConfigurationType);
        } catch (Exception e1) {
        	log.error("Can't start broker", e1);
    	}

        return ResponseUtil.wrapOrNotFound(brokerDTO);
    }

    /**
     * GET  /brokers/:id : restart the broker by "id".
     *
     * @param id the id of the brokerDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the brokerDTO, or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/restart")
    public ResponseEntity<BrokerDTO> restartBroker(@PathVariable Long id) {
        log.debug("REST request to restart Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();
        String brokerConfigurationType = brokerDTO.get().getConfigurationType();

        try {
   			brokermanager.restart(brokerType,brokerConfigurationType);
        } catch (Exception e1) {
        	log.error("Can't restart broker", e1);
    	}

        return ResponseUtil.wrapOrNotFound(brokerDTO);
    }


    /**
     * GET  /brokers/:id : stop the broker by "id".
     *
     * @param id the id of the brokerDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the brokerDTO, or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/stop")
    public ResponseEntity<BrokerDTO> stopBroker(@PathVariable Long id) {
        log.debug("REST request to stop Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();

        try {
            if (brokerType.equals("classic")) {
       			brokermanager.stop("classic");
            }else if (brokerType.equals("artemis")) {
       			brokermanager.stop("artemis");
            }

        } catch (Exception e1) {
        	log.error("Can't stop broker", e1);
    	}


        return ResponseUtil.wrapOrNotFound(brokerDTO);
    }


    /**
     * DELETE  /brokers/:id : delete the "id" broker.
     *
     * @param id the id of the brokerDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/brokers/{id}")
    public ResponseEntity<Void> deleteBroker(@PathVariable Long id) {
        log.debug("REST request to delete Broker : {}", id);
        brokerService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }


    @PostConstruct
    private void init() throws Exception {

        List<BrokerDTO> brokers = brokerService.findAll();

        for(BrokerDTO broker : brokers) {

        	if(broker.isAutoStart()) {
        		String brokerType = broker.getType();
                String brokerConfigurationType = broker.getConfigurationType();

        		brokermanager.start(brokerType, brokerConfigurationType);
        	}
        }
    }
}
