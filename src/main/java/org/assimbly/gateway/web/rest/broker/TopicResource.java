package org.assimbly.gateway.web.rest.broker;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.assimbly.gateway.service.TopicService;
import org.assimbly.gateway.service.dto.TopicDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.assimbly.gateway.domain.Topic}.
 */
@RestController
@RequestMapping("/api")
public class TopicResource {

    private final Logger log = LoggerFactory.getLogger(TopicResource.class);

    private static final String ENTITY_NAME = "topic";

    private static final String applicationName = "assimbly";

    private final TopicService topicService;

    public TopicResource(TopicService topicService) {
        this.topicService = topicService;
    }

    /**
     * {@code POST  /topics} : Create a new topic.
     *
     * @param topicDTO the topicDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new topicDTO, or with status {@code 400 (Bad Request)} if the topic has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/topics")
    public ResponseEntity<TopicDTO> createTopic(@RequestBody TopicDTO topicDTO) throws URISyntaxException {
        log.debug("REST request to save Topic : {}", topicDTO);
        if (topicDTO.getId() != null) {
            throw new BadRequestAlertException("A new topic cannot already have an ID", ENTITY_NAME, "idexists");
        }
        TopicDTO result = topicService.save(topicDTO);
        return ResponseEntity
            .created(new URI("/api/topics/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /topics} : Updates an existing topic.
     *
     * @param topicDTO the topicDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated topicDTO,
     * or with status {@code 400 (Bad Request)} if the topicDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the topicDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/topics")
    public ResponseEntity<TopicDTO> updateTopic(@RequestBody TopicDTO topicDTO) throws URISyntaxException {
        log.debug("REST request to update Topic : {}", topicDTO);
        if (topicDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        TopicDTO result = topicService.save(topicDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, topicDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /topics} : get all the topics.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of topics in body.
     */
    @GetMapping("/topics")
    public ResponseEntity<List<TopicDTO>> getAllTopics(Pageable pageable) {
        log.debug("REST request to get a page of Topics");
        Page<TopicDTO> page = topicService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /topics/:id} : get the "id" topic.
     *
     * @param id the id of the topicDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the topicDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/topics/{id}")
    public ResponseEntity<TopicDTO> getTopic(@PathVariable(value = "id") Long id) {
        log.debug("REST request to get Topic : {}", id);
        Optional<TopicDTO> topicDTO = topicService.findOne(id);
        return ResponseUtil.wrapOrNotFound(topicDTO);
    }

    /**
     * {@code DELETE  /topics/:id} : delete the "id" topic.
     *
     * @param id the id of the topicDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/topics/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable("id") Long id) {
        log.debug("REST request to delete Topic : {}", id);
        topicService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
