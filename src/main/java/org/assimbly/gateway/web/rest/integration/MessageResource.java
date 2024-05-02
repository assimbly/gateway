package org.assimbly.gateway.web.rest.integration;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

import org.assimbly.gateway.domain.Header;
import org.assimbly.gateway.domain.Message;
import org.assimbly.gateway.repository.MessageRepository;
import org.assimbly.gateway.service.MessageService;
import org.assimbly.gateway.service.dto.MessageDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Message.
 */
@RestController
@RequestMapping("/api")
public class MessageResource {

    private final Logger log = LoggerFactory.getLogger(MessageResource.class);

    private static final String ENTITY_NAME = "message";

    private final MessageService messageService;

    @Autowired
    MessageRepository messageRepository;

    public MessageResource(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * POST  /messages : Create a new message.
     *
     * @param messageDTO the messageDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new messageDTO, or with status 400 (Bad Request) if the message has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> createMessage(@RequestBody MessageDTO messageDTO) throws URISyntaxException {
        log.debug("REST request to save Message : {}", messageDTO);
        if (messageDTO.getId() != null) {
            throw new BadRequestAlertException("A new message cannot already have an ID", ENTITY_NAME, "idexists");
        }
        MessageDTO result = messageService.save(messageDTO);
        return ResponseEntity
            .created(new URI("/api/messages/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /messages : Updates an existing message.
     *
     * @param messageDTO the messageDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated messageDTO,
     * or with status 400 (Bad Request) if the messageDTO is not valid,
     * or with status 500 (Internal Server Error) if the messageDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/messages")
    public ResponseEntity<MessageDTO> updateMessage(@RequestBody MessageDTO messageDTO) throws URISyntaxException {
        log.debug("REST request to update Message : {}", messageDTO);
        if (messageDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        MessageDTO result = messageService.save(messageDTO);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, messageDTO.getId().toString())).body(result);
    }

    /**
     * GET  /messages : get all the messages.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of messages in body
     */
    @GetMapping("/messages")
    public ResponseEntity<List<MessageDTO>> getAllMessages(Pageable pageable) {
        log.debug("REST request to get all Messages");
        Page<MessageDTO> page = messageService.findAll(pageable);
        HttpHeaders messages = PaginationUtil.generatePaginationHttpHeaders(page, "/api/messages");
        return ResponseEntity.ok().headers(messages).body(page.getContent());
    }

    /**
     * GET  /messages : get all the messages.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of messages in body
     */

    @GetMapping("/messages/getallmessages")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MessageDTO>> getAllMessages() {
        log.debug("REST request to get all Messages 2");
        List<MessageDTO> messagesList = messageService.getAll();
        return ResponseEntity.ok().body(messagesList);
    }

    /**
     * GET  /messages/:id : get the "id" message.
     *
     * @param id the id of the messageDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the messageDTO, or with status 404 (Not Found)
     */
    @GetMapping("/messages/{id}")
    public ResponseEntity<MessageDTO> getMessage(@PathVariable(value = "id") Long id) {
        log.debug("REST request to get Message : {}", id);
        Optional<MessageDTO> messageDTO = messageService.findOne(id);
        return ResponseUtil.wrapOrNotFound(messageDTO);
    }

    /**
     * DELETE  /messages/:id : delete the "id" message.
     *
     * @param id the id of the messageDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable(value = "id") Long id) {
        log.debug("REST request to delete Message : {}", id);
        messageService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * GET  /messages/:id/headers : get the "id" message.
     *
     * @param id the id of the header to retrieve
     * @return the Treemap (JSON Object)
     */
    @GetMapping("/messages/{id}/headers")
    public TreeMap<String, Object> getHeaders(@PathVariable(value = "id") Long id) {
        log.debug("REST request to get Message : {}", id);
        String idAsString = Long.toString(id);
        TreeMap<String, Object> messageMap = getKeys(idAsString);
        return messageMap;
    }

    private TreeMap<String, Object> getKeys(String messageId) {
        TreeMap<String, Object> messageMap = new TreeMap<>();

        Long messageIdLong = Long.valueOf(messageId);
        Optional<Message> message = messageRepository.findById(messageIdLong);

        if (message.isPresent()) {
            Set<Header> headers = message.get().getHeaders();

            for (Header header : headers) {
                String key = header.getKey();
                String value = header.getType() + "(" + header.getValue() + ")";

                messageMap.put(key, value);
            }
        }

        return messageMap;
    }
}
