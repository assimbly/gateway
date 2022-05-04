package org.assimbly.gateway.web.rest.broker;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import javax.annotation.PostConstruct;
import org.assimbly.brokerrest.ManagedBroker;
import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.service.dto.BrokerDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Broker.
 */
@RestController
@RequestMapping("/api")
public class BrokerResource {

    private final Logger log = LoggerFactory.getLogger(BrokerResource.class);

    private static final String ENTITY_NAME = "broker";

    private final BrokerService brokerService;

    @Autowired
    private ManagedBroker managedBroker;

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
        return ResponseEntity
            .created(new URI("/api/brokers/" + result.getId()))
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
        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, brokerDTO.getId().toString())).body(result);
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
     * GET  /brokers/:id : get the broker type".
     *
     * @param id, the id of the broker to retrieve
     * @return the brokerType (artemis or classic) with status 200 (OK) or with status 404 (Not Found)
     */
    @GetMapping("/brokers/{id}/type")
    public String getBrokerType(@PathVariable Long id) {
        log.debug("REST request to get status of Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        String brokerType = brokerDTO.get().getType();

        return brokerType;
    }

    @PostConstruct
    private void init() throws Exception {
        List<BrokerDTO> brokers = brokerService.findAll();

        for (BrokerDTO broker : brokers) {
            if (broker.isAutoStart()) {
                String brokerType = broker.getType();
                String brokerConfigurationType = broker.getConfigurationType();

                log.debug("Autostart broker: " + brokerType);

                managedBroker.start(brokerType, brokerConfigurationType);
            }
        }
    }
}
