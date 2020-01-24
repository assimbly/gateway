package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

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
    @Timed
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
    @Timed
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
    @Timed
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
    @Timed
    public ResponseEntity<BrokerDTO> getBroker(@PathVariable Long id) {
        log.debug("REST request to get Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        return ResponseUtil.wrapOrNotFound(brokerDTO);
        
    }
    
    
    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param id, the id of the to retrieve
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/status")
    @Timed
    public String statusBroker(@PathVariable Long id) {
        log.debug("REST request to get status of Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();

        String status = brokermanager.getStatus(brokerType);
        
        return status;
    }

    
    /**
     * GET  /brokers/:id : get the broker info by "id".
     *
     * @param id, the id of the broker to retrieve
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/info")
    @Timed
    public String infoBroker(@PathVariable Long id) {
        log.debug("REST request to get status of Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();

        String info = brokermanager.getInfo(brokerType);
        
        return info;
    }

    /**
     * GET  /brokers/:id : get the broker status by "id".
     *
     * @param id the id of the brokerDTO to retrieve
     * @return the status (stopped or started) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/getconfiguration")
    @Timed
    public String getConfigurationBroker(@PathVariable Long id) {
        log.debug("REST request to get configuration of Broker : {}");
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();

        String configuration = brokermanager.getConfiguration(brokerType);
        
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
    @Timed
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
    @Timed
    public ResponseEntity<BrokerDTO> startBroker(@PathVariable Long id) {
        log.debug("REST request to start Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();
        String brokerConfigurationType = brokerDTO.get().getConfigurationType();

        System.out.println("Brokertype="+brokerType);
        System.out.println("BrokerConfigurationType="+brokerConfigurationType);
        
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
    @Timed
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
    @Timed
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
    @Timed
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
