package org.assimbly.gateway.web.rest.gateway;

import static org.quartz.CronScheduleBuilder.cronSchedule;

import io.swagger.v3.oas.annotations.Parameter;
import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.scheduling.ExportConfigJob;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.IntegrationService;
import org.assimbly.gateway.service.dto.IntegrationDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.LogUtil;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.quartz.impl.matchers.GroupMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Integration.
 */
@RestController
@RequestMapping("/api")
public class IntegrationResource {

    @Autowired
    private org.assimbly.gateway.config.exporting.Export confExport;

    private final Logger log = LoggerFactory.getLogger(IntegrationResource.class);

    private static final String ENTITY_NAME = "integration";

    private final IntegrationRepository integrationRepository;

    private final IntegrationService integrationService;

    private final ApplicationProperties applicationProperties;

    private Scheduler scheduler;

    private boolean ran = false;

    public IntegrationResource(IntegrationService integrationService, IntegrationRepository integrationRepository, ApplicationProperties applicationProperties)
        throws SchedulerException {
        this.integrationService = integrationService;
        this.integrationRepository = integrationRepository;
        this.applicationProperties = applicationProperties;
    }

    /**
     * POST  /integrations : Create a new integration.
     *
     * @param integrationDTO the integrationDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new integrationDTO, or with status 400 (Bad Request) if the integration has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/integrations")
    public ResponseEntity<IntegrationDTO> createIntegration(@RequestBody IntegrationDTO integrationDTO) throws URISyntaxException {
        log.debug("REST request to save Integration : {}", integrationDTO);
        if (integrationDTO.getId() != null) {
            throw new BadRequestAlertException("A new integration cannot already have an ID", ENTITY_NAME, "idexists");
        }
        IntegrationDTO result = integrationService.save(integrationDTO);
        return ResponseEntity
            .created(new URI("/api/integrations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /integrations : Updates an existing integration.
     *
     * @param integrationDTO the integrationDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated integrationDTO,
     * or with status 400 (Bad Request) if the integrationDTO is not valid,
     * or with status 500 (Internal Server Error) if the integrationDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/integrations")
    public ResponseEntity<IntegrationDTO> updateIntegration(@RequestBody IntegrationDTO integrationDTO) throws URISyntaxException {
        log.debug("REST request to update Integration : {}", integrationDTO);
        if (integrationDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        IntegrationDTO result = integrationService.save(integrationDTO);

        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, integrationDTO.getId().toString())).body(result);
    }

    private boolean isCreated(String groupName) throws SchedulerException {
        for (String name : scheduler.getJobGroupNames()) {
            if (name.equals(groupName)) return true;
        }
        return false;
    }

    private JobKey getJobKey(String name) throws SchedulerException {
        for (String groupName : scheduler.getJobGroupNames()) {
            for (JobKey jobKey : scheduler.getJobKeys(GroupMatcher.jobGroupEquals(groupName))) {
                if (name.equals(jobKey.getName())) {
                    return jobKey;
                }
            }
        }
        return null;
    }

    private void scheduleJob(Trigger trigger, int integrationid, String url) throws SchedulerException {
        if (isCreated("" + integrationid)) scheduler.deleteJob(getJobKey("" + integrationid));
        scheduler.getContext().put("integrationid", integrationid);
        scheduler.getContext().put("database", confExport);
        scheduler.getContext().put("url", url);
        scheduler.scheduleJob(JobBuilder.newJob(ExportConfigJob.class).withIdentity("" + integrationid, "" + integrationid).build(), trigger);
    }

    /**
     * POST  /updatebackup : updates the backup frequency
     *
     * @param integrationid
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the stopping integration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(
        path = "/integrations/{integrationid}/updatebackup/{frequency}",
        consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE},
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> updateBackup(
        @Parameter(hidden = true) @RequestHeader("Accept") String mediaType,
        @PathVariable Long integrationid,
        @PathVariable String frequency,
        @RequestBody String url
    ) throws Exception {
        if (!ran) {
            scheduler = StdSchedulerFactory.getDefaultScheduler();
            scheduler.start();
            ran = true;
        }
        switch (frequency) {
            case "Daily":
                scheduleJob(
                    TriggerBuilder.newTrigger().withIdentity("" + integrationid).withSchedule(cronSchedule("0 0 10 ? * MON-FRI *")).build(),
                    Math.toIntExact(integrationid),
                    url
                );
                break;
            case "Weekly":
                scheduleJob(
                    TriggerBuilder.newTrigger().withIdentity("" + integrationid).withSchedule(cronSchedule("0 0 10 ? * MON *")).build(),
                    Math.toIntExact(integrationid),
                    url
                );
                break;
            case "Monthly":
                scheduleJob(
                    TriggerBuilder.newTrigger().withIdentity("" + integrationid).withSchedule(cronSchedule("0 0 10 1 1/1 ? *")).build(),
                    Math.toIntExact(integrationid),
                    url
                );
                break;
            default:
                if (isCreated("" + integrationid)) scheduler.deleteJob(getJobKey("" + integrationid));
                break;
        }
        return org.assimbly.gateway.web.rest.util.ResponseUtil.createSuccessResponse(
            integrationid,
            mediaType,
            "/integrations/{integrationid}/updatebackup/{frequency}",
            "Backup frequency updated"
        );
    }

    /**
     * GET  /integrations : get all the integrations.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of integrations in body
     */
    @GetMapping("/integrations")
    public List<IntegrationDTO> getAllIntegrations() {
        log.debug("REST request to get all Integrations");
        return integrationService.findAll();
    }

    /**
     * GET  /integrations/:id : get the "id" integration.
     *
     * @param id the id of the integrationDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the integrationDTO, or with status 404 (Not Found)
     */
    @GetMapping("/integrations/{id}")
    public ResponseEntity<IntegrationDTO> getIntegration(@PathVariable Long id) {
        log.error("Runs..");
        log.debug("Runs...");
        log.debug("REST request to get Integration : {}", id);
        Optional<IntegrationDTO> integrationDTO = integrationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(integrationDTO);
    }

    /**
     * DELETE  /integrations/:id : delete the "id" integration.
     *
     * @param id the id of the integrationDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/integrations/{id}")
    public ResponseEntity<Void> deleteIntegration(@PathVariable Long id) {
        log.debug("REST request to delete Integration : {}", id);

        integrationRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * Get  /getlog : get tail of log file for the webapplication.
     *
     * @param lines (number of lines to return)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @GetMapping(
        path = "/logs/{integrationid}/log/{lines}",
        produces = {MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getLog(
        @Parameter(hidden = true) @RequestHeader("Accept") String mediaType,
        @PathVariable Long integrationid,
        @PathVariable int lines
    ) throws Exception {
        try {
            File file = new File(System.getProperty("java.io.tmpdir") + "/spring.log");
            String log = LogUtil.tail(file, lines);
            return org.assimbly.gateway.web.rest.util.ResponseUtil.createSuccessResponse(integrationid, mediaType, "getLog", log, true);
        } catch (Exception e) {
            return org.assimbly.gateway.web.rest.util.ResponseUtil.createFailureResponse(integrationid, mediaType, "getLog", e.getMessage());
        }
    }
}
