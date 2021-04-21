package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.QueueDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * Service Interface for managing {@link org.assimbly.gateway.domain.Queue}.
 */
public interface QueueService {

    /**
     * Save a queue.
     *
     * @param queueDTO the entity to save.
     * @return the persisted entity.
     */
    QueueDTO save(QueueDTO queueDTO);

    /**
     * Get all the queues.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<QueueDTO> findAll(Pageable pageable);

    /**
     * Get the "id" queue.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<QueueDTO> findOne(Long id);

    /**
     * Delete the "id" queue.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
