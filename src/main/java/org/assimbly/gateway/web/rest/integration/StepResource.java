package org.assimbly.gateway.web.rest.integration;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.gateway.service.StepService;
import org.assimbly.gateway.service.dto.StepDTO;
import org.assimbly.gateway.service.mapper.StepMapper;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Step.
 */
@RestController
@RequestMapping("/api")
public class StepResource {

    private final Logger log = LoggerFactory.getLogger(StepResource.class);

    private static final String ENTITY_NAME = "step";

    private final StepService stepService;

    private final StepRepository stepRepository;

    private final StepMapper stepMapper;

    public StepResource(StepService stepService, StepRepository stepRepository, StepMapper stepMapper) {
        this.stepService = stepService;
        this.stepRepository = stepRepository;
        this.stepMapper = stepMapper;
    }

    /**
     * POST  /steps : Create a new step.
     *
     * @param stepDTO the stepDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new stepDTO, or with status 400 (Bad Request) if the step has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/step")
    public ResponseEntity<StepDTO> createStep(@RequestBody StepDTO stepDTO) throws URISyntaxException {
        log.debug("REST request to save Step : {}", stepDTO);
        if (stepDTO.getId() != null) {
            throw new BadRequestAlertException("A new step cannot already have an ID", ENTITY_NAME, "idexists");
        }

        StepDTO result = stepService.save(stepDTO);
        return ResponseEntity
            .created(new URI("/api/from-steps/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * POST  /steps : Create a new steps.
     *
     * @param stepsDTO the stepsDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new stepDTO, or with status 400 (Bad Request) if the step has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/steps")
    public ResponseEntity<List<StepDTO>> createSteps(@RequestBody List<StepDTO> stepsDTO) throws URISyntaxException {
        log.debug("REST request to save List<Step> : {}", stepsDTO);

        List<Step> steps = stepMapper.toEntity(stepsDTO);
        steps = stepRepository.saveAll(steps);
        List<StepDTO> results = stepMapper.toDto(steps);
        return ResponseEntity.created(new URI("/api/steps/")).body(results);
    }

    /**
     * PUT  /step : Updates an existing step.
     *
     * @param stepDTO the stepDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated stepDTO,
     * or with status 400 (Bad Request) if the stepDTO is not valid,
     * or with status 500 (Internal Server Error) if the stepDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/step")
    public ResponseEntity<StepDTO> updateStep(@RequestBody StepDTO stepDTO) throws URISyntaxException {
        log.debug("REST request to update Step : {}", stepDTO);
        if (stepDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        StepDTO result = stepService.save(stepDTO);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, stepDTO.getId().toString())).body(result);
    }

    /**
     * PUT  /steps : Updates an existing steps.
     *
     * @param stepsDTO the stepsDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated stepsDTO,
     * or with status 400 (Bad Request) if the stepsDTO is not valid,
     * or with status 500 (Internal Server Error) if the stepsDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/steps")
    public ResponseEntity<List<StepDTO>> updateSteps(@RequestBody List<StepDTO> stepsDTO) throws URISyntaxException {
        log.debug("REST request to update Steps : {}", stepsDTO);

        List<Step> steps = stepMapper.toEntity(stepsDTO);
        steps = stepRepository.saveAll(steps);
        List<StepDTO> results = stepMapper.toDto(steps);

        return ResponseEntity.ok().body(results);
    }

    /**
     * GET  /steps : get all the steps.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of steps in body
     */
    @GetMapping("/steps")
    public List<StepDTO> getAllSteps() {
        log.debug("REST request to get all Steps");
        return stepService.findAll();
    }

    /**
     * GET  /steps/byflowid/:id : get the "id" step.
     *
     * @param id the id of the stepDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the stepDTO, or with status 404 (Not Found)
     */
    @GetMapping("/steps/byflowid/{id}")
    public List<StepDTO> getStepByFlowID(@PathVariable(value = "id") Long id) {
        log.debug("REST request to get Steps by flowId " + id);
        List<Step> steps = stepRepository.findByFlowId(id);
        return stepMapper.toDto(steps);
    }

    /**
     * GET  /step/:id : get the "id" step.
     *
     * @param id the id of the stepDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the stepDTO, or with status 404 (Not Found)
     */
    @GetMapping("/step/{id}")
    public ResponseEntity<StepDTO> getStepID(@PathVariable(value = "id") Long id) {
        log.debug("REST request to get Step : {}", id);
        Optional<StepDTO> stepDTO = stepService.findOne(id);
        return ResponseUtil.wrapOrNotFound(stepDTO);
    }

    /**
     * DELETE  /steps/:id : delete the "id" step.
     *
     * @param id the id of the stepDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/steps/{id}")
    public ResponseEntity<Void> deleteStep(@PathVariable(value = "id") Long id) {
        log.debug("REST request to delete Step : {}", id);
        stepService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * DELETE  /steps : delete list of steps.
     *
     * @param list of stepsDTO's to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/steps")
    public ResponseEntity<Void> deleteSteps(@RequestBody List<StepDTO> stepsDTO) throws URISyntaxException {
        log.debug("REST request to delete List<Step> : {}", stepsDTO);
        List<Step> steps = stepMapper.toEntity(stepsDTO);

        ArrayList<String> arrayOfIds = new ArrayList<String>();
        for (Step step : steps) {
            arrayOfIds.add(step.getId().toString());
        }

        stepRepository.deleteAllInBatch(steps);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, arrayOfIds.toString())).build();
    }
}
