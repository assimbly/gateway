package org.assimbly.gateway.web.rest.broker;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Lazy;
import jakarta.annotation.PostConstruct;
import org.assimbly.brokerrest.ManagedBrokerRuntime;
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

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * REST controller for managing Broker.
 */
@Tag(name = "Brokers", description = "Manage the broker configurations")
@Lazy(false)
@DependsOn("firstStart") // a new Gateway's default broker must exist before the brokers are autostarted
@RestController
@RequestMapping("/api")
public class BrokerResource {

    private final Logger log = LoggerFactory.getLogger(BrokerResource.class);

    private static final String ENTITY_NAME = "broker";

    // Artemis waits here, without end and without logging, while another broker holds the lock on its journal
    private static final String ARTEMIS_LOCK_CLASS = "org.apache.activemq.artemis.core.server.impl.FileLockNodeManager";

    private final BrokerService brokerService;

    @Autowired
    private ManagedBrokerRuntime managedBroker;

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
    @Operation(summary = "Create a broker")
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
    @Operation(summary = "Update a broker")
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
    @Operation(summary = "Delete a broker")
    @DeleteMapping("/brokers/{id}")
    public ResponseEntity<Void> deleteBroker(@PathVariable(value = "id") Long id) {
        log.debug("REST request to delete Broker : {}", id);

        // A deleted broker must not keep running (and listening) until the Gateway restarts
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);
        if (brokerDTO.isPresent() && brokerDTO.get().getType() != null) {
            try {
                managedBroker.stop(brokerDTO.get().getType());
            } catch (Exception e) {
                log.error("Failed to stop broker {} before deleting it", id, e);
                throw new BadRequestAlertException("Could not stop the broker, so it was not deleted: " + e.getMessage(), ENTITY_NAME, "brokerstopfailed");
            }
        }

        brokerService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * GET  /brokers : get all the brokers.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of brokers in body
     */
    @Operation(summary = "List brokers")
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
    @Operation(summary = "Get a broker")
    @GetMapping("/brokers/{id}")
    public ResponseEntity<BrokerDTO> getBroker(@PathVariable(value = "id") Long id) {
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
    @Operation(summary = "Get the type of a broker")
    @GetMapping("/brokers/{id}/type")
    public String getBrokerType(@PathVariable(value = "id") Long id) {
        log.debug("REST request to get type of Broker : {}", id);
        Optional<BrokerDTO> brokerDTO = brokerService.findOne(id);

        if(brokerDTO.isEmpty()){
            return "unknown";
        }

        return brokerDTO.get().getType();
    }

    @PostConstruct
    private void init() throws Exception {

        List<BrokerDTO> brokers = brokerService.findAll();

        for (BrokerDTO broker : brokers) {

            if (Boolean.TRUE.equals(broker.isAutoStart())) {

                String brokerType = broker.getType();
                String brokerConfigurationType = broker.getConfigurationType();

                log.info("Autostart broker: {}", brokerType);

                autostart(brokerType, brokerConfigurationType);

            }
        }
    }

    /**
     * Starts the broker and warns while it waits for the lock on its journal, which another broker
     * (for example a Gateway that is still running) holds. The Gateway doesn't finish starting until then.
     */
    private void autostart(String brokerType, String brokerConfigurationType) throws Exception {

        Thread startThread = Thread.currentThread();
        ScheduledExecutorService watchdog = Executors.newSingleThreadScheduledExecutor(
            Thread.ofPlatform().name("broker-autostart-watchdog").daemon().factory());

        watchdog.scheduleAtFixedRate(() -> {
            if (isWaitingForLock(startThread)) {
                log.warn("Broker {} can't start: another broker holds the lock (server.lock) on its journal directory. " +
                    "Probably another Gateway is still running, for example from an earlier bootRun. " +
                    "This Gateway doesn't finish starting until that one is stopped.", brokerType);
            }
        }, 10, 30, TimeUnit.SECONDS);

        try {
            managedBroker.start(brokerType, brokerConfigurationType);
        } finally {
            watchdog.shutdownNow();
        }
    }

    private static boolean isWaitingForLock(Thread thread) {
        for (StackTraceElement element : thread.getStackTrace()) {
            if (ARTEMIS_LOCK_CLASS.equals(element.getClassName()) && "lock".equals(element.getMethodName())) {
                return true;
            }
        }
        return false;
    }
}
