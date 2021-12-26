package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.QueueService;
import org.assimbly.gateway.domain.Queue;
import org.assimbly.gateway.repository.QueueRepository;
import org.assimbly.gateway.service.dto.QueueDTO;
import org.assimbly.gateway.service.mapper.QueueMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing {@link Queue}.
 */
@Service
@Transactional
public class QueueServiceImpl implements QueueService {

    private final Logger log = LoggerFactory.getLogger(QueueServiceImpl.class);

    private final QueueRepository queueRepository;

    private final QueueMapper queueMapper;

    public QueueServiceImpl(QueueRepository queueRepository, QueueMapper queueMapper) {
        this.queueRepository = queueRepository;
        this.queueMapper = queueMapper;
    }

    /**
     * Save a queue.
     *
     * @param queueDTO the entity to save.
     * @return the persisted entity.
     */
    @Override
    public QueueDTO save(QueueDTO queueDTO) {
        log.debug("Request to save Queue : {}", queueDTO);
        Queue queue = queueMapper.toEntity(queueDTO);
        queue = queueRepository.save(queue);
        return queueMapper.toDto(queue);
    }

    /**
     * Get all the queues.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<QueueDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Queues");
        return queueRepository.findAll(pageable)
            .map(queueMapper::toDto);
    }

    /**
     * Get one queue by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<QueueDTO> findOne(Long id) {
        log.debug("Request to get Queue : {}", id);
        return queueRepository.findById(id)
            .map(queueMapper::toDto);
    }

    /**
     * Delete the queue by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Queue : {}", id);
        queueRepository.deleteById(id);
    }
}
