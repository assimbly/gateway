package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.assimbly.camelconnector.connect.Connector;
import org.assimbly.camelconnector.connect.impl.CamelConnector;
import org.assimbly.gateway.config.camelroutes.AssimblyDBConfiguration;
import org.assimbly.gateway.domain.CamelRoute;
import org.assimbly.gateway.repository.CamelRouteRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.CamelRouteDTO;
import org.assimbly.gateway.service.mapper.CamelRouteMapper;
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
 * REST controller for managing CamelRoute.
 */
@RestController
@RequestMapping("/api")
public class CamelRouteResource {

    private final Logger log = LoggerFactory.getLogger(CamelRouteResource.class);

    private static final String ENTITY_NAME = "camelRoute";

    private final CamelRouteRepository camelRouteRepository;

    private final CamelRouteMapper camelRouteMapper;

	@Autowired
	private AssimblyDBConfiguration assimblyDBConfiguration;

	private Connector connector = new CamelConnector();
   
    public CamelRouteResource(CamelRouteRepository camelRouteRepository, CamelRouteMapper camelRouteMapper) {
        this.camelRouteRepository = camelRouteRepository;
        this.camelRouteMapper = camelRouteMapper;
    }

    /**
     * POST  /camel-routes : Create a new camelRoute.
     *
     * @param camelRouteDTO the camelRouteDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new camelRouteDTO, or with status 400 (Bad Request) if the camelRoute has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/camel-routes")
    @Timed
    public ResponseEntity<CamelRouteDTO> createCamelRoute(@RequestBody CamelRouteDTO camelRouteDTO) throws URISyntaxException {
        log.debug("REST request to save CamelRoute : {}", camelRouteDTO);
        if (camelRouteDTO.getId() != null) {
            throw new BadRequestAlertException("A new camelRoute cannot already have an ID", ENTITY_NAME, "idexists");
        }
        CamelRoute camelRoute = camelRouteMapper.toEntity(camelRouteDTO);
        camelRoute = camelRouteRepository.save(camelRoute);
        CamelRouteDTO result = camelRouteMapper.toDto(camelRoute);
        return ResponseEntity.created(new URI("/api/camel-routes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /camel-routes : Updates an existing camelRoute.
     *
     * @param camelRouteDTO the camelRouteDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated camelRouteDTO,
     * or with status 400 (Bad Request) if the camelRouteDTO is not valid,
     * or with status 500 (Internal Server Error) if the camelRouteDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/camel-routes")
    @Timed
    public ResponseEntity<CamelRouteDTO> updateCamelRoute(@RequestBody CamelRouteDTO camelRouteDTO) throws URISyntaxException {
        log.debug("REST request to update CamelRoute : {}", camelRouteDTO);
        if (camelRouteDTO.getId() == null) {
            return createCamelRoute(camelRouteDTO);
        }
        CamelRoute camelRoute = camelRouteMapper.toEntity(camelRouteDTO);
        camelRoute = camelRouteRepository.save(camelRoute);
        CamelRouteDTO result = camelRouteMapper.toDto(camelRoute);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, camelRouteDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /camel-routes : get all the camelRoutes.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of camelRoutes in body
     */
    @GetMapping("/camel-routes")
    @Timed
    public ResponseEntity<List<CamelRouteDTO>> getAllCamelRoutes(Pageable pageable) {
        log.debug("REST request to get a page of CamelRoutes");
        Page<CamelRoute> page = camelRouteRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/camel-routes");
        return new ResponseEntity<>(camelRouteMapper.toDto(page.getContent()), headers, HttpStatus.OK);
    }

    /**
     * GET  /camel-routes/:id : get the "id" camelRoute.
     *
     * @param id the id of the camelRouteDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the camelRouteDTO, or with status 404 (Not Found)
     */
    @GetMapping("/camel-routes/{id}")
    @Timed
    public ResponseEntity<CamelRouteDTO> getCamelRoute(@PathVariable Long id) {
        log.debug("REST request to get CamelRoute : {}", id);
        CamelRoute camelRoute = camelRouteRepository.findOne(id);
        CamelRouteDTO camelRouteDTO = camelRouteMapper.toDto(camelRoute);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(camelRouteDTO));
    }

    /**
     * DELETE  /camel-routes/:id : delete the "id" camelRoute.
     *
     * @param id the id of the camelRouteDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/camel-routes/{id}")
    @Timed
    public ResponseEntity<Void> deleteCamelRoute(@PathVariable Long id) {
        log.debug("REST request to delete CamelRoute : {}", id);
        camelRouteRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
    @GetMapping("/camel-routes/start/{id}")
    @Timed
    public ResponseEntity<Void> startCamelRoute(@PathVariable Long id) throws URISyntaxException {

    	String routeID = id.toString();
    	String routeName = camelRouteRepository.findOne(id).getName();

       	log.info("REST request to start route " + routeName);
		
    	try {
            if(!connector.isStarted()){
            	connector.start();
            }	
            
        	if(!connector.hasRoute(routeID)) {
    			TreeMap<String, String> properties = assimblyDBConfiguration.set(id);
    			connector.addConfiguration(properties);
        	}
            	
   			connector.startRoute(routeID);
   	       	log.info("Started route " + routeName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createStartAlert(routeName)).build();
   			//return true;
    	} catch (Exception e) {
			log.debug("Can't start route" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.camelFailureAlert(routeName,"Can't start",e.getMessage())).build();
		}
    }

    @GetMapping("/camel-routes/stop/{id}")
    @Timed
    public ResponseEntity<Void>  stopCamelRoute(@PathVariable Long id) throws URISyntaxException {

       	String routeID = id.toString();
    	String routeName = camelRouteRepository.findOne(id).getName();

       	log.info("REST request to stop route " + routeName);
    	
        try {
			connector.stopRoute(routeID);
	       	log.info("Stopped route " + routeName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createStopAlert(routeName)).build();
		} catch (Exception e) {
			log.debug("Can't stop route" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.camelFailureAlert(routeName,"Can't start",e.getMessage())).build();
		}    
     }

    @GetMapping("/camel-routes/restart/{id}")
    @Timed
    public ResponseEntity<Void>  restartCamelRoute(@PathVariable Long id) throws URISyntaxException {
    	String routeID = id.toString();
    	String routeName = camelRouteRepository.findOne(id).getName();

       	log.info("REST request to restart route " + routeName);
		
    	try {
            if(!connector.isStarted()){
            	connector.start();        
            }	
            
        	if(!connector.hasRoute(routeID)) {
    			TreeMap<String, String> properties = assimblyDBConfiguration.set(id);
    			connector.addConfiguration(properties);
        	}
            	
   			connector.restartRoute(routeID);
   	       	log.info("Started route " + routeName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createRestartAlert(routeName)).build();
    	} catch (Exception e) {
			log.debug("Can't start route" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.camelFailureAlert(routeName,"Can't start",e.getMessage())).build();
		}
    }    

    @GetMapping("/camel-routes/pause/{id}")
    @Timed
    public ResponseEntity<Void>  pauseCamelRoute(@PathVariable Long id) throws URISyntaxException {

       	String routeID = id.toString();
    	String routeName = camelRouteRepository.findOne(id).getName();

       	log.info("REST request to pause route " + routeName);
    	
        try {
			connector.stopRoute(routeID);
	       	log.info("Paused route " + routeName);
   	        return ResponseEntity.ok().headers(HeaderUtil.createPauseAlert(routeName)).build();
		} catch (Exception e) {
			log.debug("Can't pause route" + e);
	        return ResponseEntity.ok().headers(HeaderUtil.camelFailureAlert(routeName,"Can't start",e.getMessage())).build();
		}    
     }
    
    @GetMapping("/camel-routes/status/{id}")
    @Timed
    public String statusCamelRoute(@PathVariable Long id) throws URISyntaxException {
    	String routeID = id.toString();

    	try {    		
			return connector.getRouteStatus(routeID);
		} catch (Exception e) {
			log.debug("Can't retrieve status." + e);
			return "unknown";
		}   
    }
}
