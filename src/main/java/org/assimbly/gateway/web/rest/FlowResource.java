package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.assimbly.connector.Connector;
import org.assimbly.connector.impl.CamelConnector;
import org.assimbly.gateway.config.flows.AssimblyDBConfiguration;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.ErrorEndpointRepository;
import org.assimbly.gateway.repository.FromEndpointRepository;
import org.assimbly.gateway.repository.ToEndpointRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.service.mapper.FlowMapper;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;
import java.util.TreeMap;

/**
 * REST controller for managing flow.
 */
@RestController
@RequestMapping("/api")
public class FlowResource {

    private final Logger log = LoggerFactory.getLogger(FlowResource.class);

    private static final String ENTITY_NAME = "flow";

    private final FlowRepository flowRepository;
    private final FromEndpointRepository fromEndpointRepository;
    private final ErrorEndpointRepository errorEndpointRepository;
    private final ToEndpointRepository toEndpointRepository;
    
    private final FlowMapper flowMapper;

	@Autowired
	private AssimblyDBConfiguration assimblyDBConfiguration;

	private Connector connector = new CamelConnector();

	String flowID;
	String flowName;

	private String configurationType;
	
    public FlowResource(FlowRepository flowRepository, FromEndpointRepository fromEndpointRepository, ErrorEndpointRepository errorEndpointRepository, ToEndpointRepository toEndpointRepository, FlowMapper flowMapper) {
        this.flowRepository = flowRepository;
        this.fromEndpointRepository = fromEndpointRepository;
        this.errorEndpointRepository = errorEndpointRepository;
        this.toEndpointRepository = toEndpointRepository;

        this.flowMapper = flowMapper;
    }

    /**
     * POST  /flows : Create a new flow.
     *
     * @param FlowDTO the FlowDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new FlowDTO, or with status 400 (Bad Request) if the flow has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/flows")
    @Timed
    public ResponseEntity<FlowDTO> createflow(@RequestBody FlowDTO FlowDTO) throws URISyntaxException {
        log.debug("REST request to save flow : {}", FlowDTO);
        if (FlowDTO.getId() != null) {
            throw new BadRequestAlertException("A new flow cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Flow flow = flowMapper.toEntity(FlowDTO);
        flow = flowRepository.save(flow);
        FlowDTO result = flowMapper.toDto(flow);
        return ResponseEntity.created(new URI("/api/flows/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /flows : Updates an existing flow.
     *
     * @param FlowDTO the FlowDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated FlowDTO,
     * or with status 400 (Bad Request) if the FlowDTO is not valid,
     * or with status 500 (Internal Server Error) if the FlowDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/flows")
    @Timed
    public ResponseEntity<FlowDTO> updateflow(@RequestBody FlowDTO FlowDTO) throws URISyntaxException {
        log.debug("REST request to update flow : {}", FlowDTO);
        if (FlowDTO.getId() == null) {
            return createflow(FlowDTO);
        }
        Flow flow = flowMapper.toEntity(FlowDTO);
        flow = flowRepository.save(flow);
        FlowDTO result = flowMapper.toDto(flow);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, FlowDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /flows : get all the flows.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of flows in body
     */
    @GetMapping("/flows")
    @Timed
    public ResponseEntity<List<FlowDTO>> getAllflows(Pageable pageable) {
        log.debug("REST request to get a page of flows");
        Page<Flow> page = flowRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/flows");
        return new ResponseEntity<>(flowMapper.toDto(page.getContent()), headers, HttpStatus.OK);
    }

    /**
     * GET  /flows/:id : get the "id" flow.
     *
     * @param id the id of the FlowDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the FlowDTO, or with status 404 (Not Found)
     */
    @GetMapping("/flows/{id}")
    @Timed
    public ResponseEntity<FlowDTO> getflow(@PathVariable Long id) {
        log.debug("REST request to get flow : {}", id);
        Flow flow = flowRepository.findOne(id);
        FlowDTO FlowDTO = flowMapper.toDto(flow);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(FlowDTO));
    }

    /**
     * DELETE  /flows/:id : delete the "id" flow.
     *
     * @param id the id of the FlowDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/flows/{id}")
    @Timed
    public ResponseEntity<Void> deleteflow(@PathVariable Long id) {
        log.debug("REST request to delete complete flow : {}", id);
        flowRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * POST  /flows/setconfiguration : live configuration from XML.
     *
     * @param id the id of the FlowDTO
     * @return the ResponseEntity with status 201 (Created) and with body the new FlowDTO, or with status 400 (Bad Request) if the flow has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/flows/setconfiguration/{id}", produces = "text/plain")
    @Timed
    public String setConfiguration(@PathVariable Long id) throws URISyntaxException {
        
    	log.debug("REST request to set configuration : " + id.toString());
    	
    	try {
    		configureRoute("db",id,null);
    		return "succesful";
		} catch (Exception e) {
			log.error(e.getMessage());
			return "failed";
		}
    }    
    
    
    /**
     * POST  /flows/setliveconfiguration : live configuration from XML.
     *
     * @param id the id of the FlowDTO
     * @param xml configuration
     * @return the ResponseEntity with status 201 (Created) and with body the new FlowDTO, or with status 400 (Bad Request) if the flow has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/flows/setliveconfiguration/{id}", consumes = "application/xml", produces = "text/plain")
    @Timed
    public String setLiveConfiguration(@PathVariable Long id,@RequestBody String xmlConfiguration) throws URISyntaxException {
        
    	log.debug("REST request to set live ((xml) configuration : " + xmlConfiguration);
    	
    	try {
			connector.convertXMLToConfiguration(id.toString(), xmlConfiguration);
			return "ok";
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return "nok";
		}
    	
    	/*
    	try {
    		configureRoute("xml",id,xmlConfiguration);
    		return "succesful";
		} catch (Exception e) {
			log.error(e.getMessage());
			return "failed";
		}
		*/
    }        
    
    
	//Lifecycle management
    
    @GetMapping("/flows/start/{id}")
    @Timed
    public ResponseEntity<Void> startflow(@PathVariable Long id) throws URISyntaxException {
		
    	try {
        	initRoute("start",id);
    		connector.startFlow(flowID);
   	       	log.info("Started flow " + flowName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createStartAlert(flowName)).build();
    	} catch (Exception e) {
			log.debug("Can't start flow" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.createFailureAlert(flowName,"Can't start",e.getMessage())).build();
		}
    }

	@GetMapping("/flows/stop/{id}")
    @Timed
    public ResponseEntity<Void>  stopflow(@PathVariable Long id) throws URISyntaxException {
    	
        try {
        	initRoute("stop",id);
        	connector.stopFlow(flowID);
	       	log.info("Stopped flow " + flowName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createStopAlert(flowName)).build();
		} catch (Exception e) {
			log.debug("Can't stop flow" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.createFailureAlert(flowName,"Can't stop",e.getMessage())).build();
		}    
     }

    @GetMapping("/flows/restart/{id}")
    @Timed
    public ResponseEntity<Void>  restartflow(@PathVariable Long id) throws URISyntaxException {
  	
		
    	try {
        	initRoute("restart",id);
   			connector.restartFlow(flowID);
   	       	log.info("Restarted flow " + flowName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createRestartAlert(flowName)).build();
    	} catch (Exception e) {
			log.debug("Can't restart flow" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.createFailureAlert(flowName,"Can't restart",e.getMessage())).build();
		}
    }    

    @GetMapping("/flows/pause/{id}")
    @Timed
    public ResponseEntity<Void>  pauseflow(@PathVariable Long id) throws URISyntaxException {

    	
        try {
        	initRoute("pause",id);
        	connector.pauseFlow(flowID);
	       	log.info("Paused flow " + flowName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createPauseAlert(flowName)).build();
		} catch (Exception e) {
			log.debug("Can't pause flow" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.createFailureAlert(flowName,"Can't pause",e.getMessage())).build();
		}    
     }

    @GetMapping("/flows/resume/{id}")
    @Timed
    public ResponseEntity<Void>  resumeflow(@PathVariable Long id) throws URISyntaxException {

        try {
        	initRoute("resume",id);
			connector.resumeFlow(flowID);
	       	log.info("Resumed flow " + flowName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createResumeAlert(flowName)).build();
		} catch (Exception e) {
			log.debug("Can't resume flow" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.createFailureAlert(flowName,"Can't resume",e.getMessage())).build();
		}    
     }    
    
    @GetMapping("/flows/status/{id}")
    @Timed
    public String statusflow(@PathVariable Long id) throws Exception {

    	try {    		
        	initRoute("status",id);
    		return connector.getFlowStatus(flowID);
		} catch (Exception e) {
			log.debug("Can't retrieve status." + e);
			return "unknown status";
		}  
    	
    }

    
    //private methods    
    private void initRoute(String action, Long id) throws Exception {
    
    	flowID = id.toString();
    	Flow flow = flowRepository.findOne(id);

    	if(flow==null) {
    		flowName = flowID;
       		configurationType = "xml";
    	}else {
    		flowName = flow.getName();
    		configurationType = "db";
    	}

       	log.info("REST request to " + action + " flow " + flowName);
		
       	if(!connector.isStarted()){
        	try {
				connector.start();
			} catch (Exception e) {
				e.printStackTrace();
			}
        }

       	if(configurationType.equals("db") && (action.equals("start")||action.equals("restart"))) {
       		configureRoute(configurationType,id,null);
       	}       	
	}
    
    private void configureRoute(String configurationType, Long flowId, String configuration) throws Exception {
    
		TreeMap<String, String> properties;
		
		if(configurationType.equals("db")) {
			properties = assimblyDBConfiguration.convertDBToFlowConfiguration(flowId);
			connector.setFlowConfiguration(properties);
		}else if(configurationType.equals("xml")) {
			properties = connector.convertXMLToFlowConfiguration(flowId.toString(), configuration);
			connector.setFlowConfiguration(properties);
		}			
    }    
}