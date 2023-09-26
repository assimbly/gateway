package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.MessageDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Message.
 */
public interface MessageService {

    /**
     * Save a message.
     *
     * @param messageDTO the entity to save
     * @return the persisted entity
     */
    MessageDTO save(MessageDTO messageDTO);

    /**
     * Get all the messages (page).
     *
     * @return the list of entities
     */
    Page<MessageDTO> findAll(Pageable pageable);

    /**
     * Get all the messages.
     *
     * @return the list of entities
     */
    List<MessageDTO> getAll();

    /**
     * Get the "id" message.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<MessageDTO> findOne(Long id);

    /**
     * Get the message by name.
     *
     * @param name the name of the entity
     * @return the entity
     */
    Optional<MessageDTO> findByName(String name);

    /**
     * Delete the "id" message.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

}
