package org.assimbly.gateway.web.rest.broker;

import org.assimbly.gateway.service.QueueService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.service.dto.QueueDTO;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.PaginationUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link org.assimbly.gateway.domain.Queue}.
 */
@RestController
@RequestMapping("/api")
public class QueueResource {

    private final Logger log = LoggerFactory.getLogger(QueueResource.class);

    private static final String ENTITY_NAME = "queue";

    private static final String applicationName = "assimbly";

    private final QueueService queueService;

    public QueueResource(QueueService queueService) {
        this.queueService = queueService;
    }

    /**
     * {@code POST  /queues} : Create a new queue.
     *
     * @param queueDTO the queueDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new queueDTO, or with status {@code 400 (Bad Request)} if the queue has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/queues")
    public ResponseEntity<QueueDTO> createQueue(@RequestBody QueueDTO queueDTO) throws URISyntaxException {
        log.debug("REST request to save Queue : {}", queueDTO);
        if (queueDTO.getId() != null) {
            throw new BadRequestAlertException("A new queue cannot already have an ID", ENTITY_NAME, "idexists");
        }
        QueueDTO result = queueService.save(queueDTO);
        return ResponseEntity.created(new URI("/api/queues/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /queues} : Updates an existing queue.
     *
     * @param queueDTO the queueDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated queueDTO,
     * or with status {@code 400 (Bad Request)} if the queueDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the queueDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/queues")
    public ResponseEntity<QueueDTO> updateQueue(@RequestBody QueueDTO queueDTO) throws URISyntaxException {
        log.debug("REST request to update Queue : {}", queueDTO);
        if (queueDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        QueueDTO result = queueService.save(queueDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, queueDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /queues} : get all the queues.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of queues in body.
     */
    @GetMapping("/queues")
    public ResponseEntity<List<QueueDTO>> getAllQueues(Pageable pageable) {
        log.debug("REST request to get a page of Queues");
        Page<QueueDTO> page = queueService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /queues/:id} : get the "id" queue.
     *
     * @param id the id of the queueDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the queueDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/queues/{id}")
    public ResponseEntity<QueueDTO> getQueue(@PathVariable Long id) {
        log.debug("REST request to get Queue : {}", id);
        Optional<QueueDTO> queueDTO = queueService.findOne(id);
        return ResponseUtil.wrapOrNotFound(queueDTO);
    }

    /**
     * {@code DELETE  /queues/:id} : delete the "id" queue.
     *
     * @param id the id of the queueDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/queues/{id}")
    public ResponseEntity<Void> deleteQueue(@PathVariable Long id) {
        log.debug("REST request to delete Queue : {}", id);
        queueService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString())).build();
    }
}
