package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.TopicService;
import org.assimbly.gateway.domain.Topic;
import org.assimbly.gateway.repository.TopicRepository;
import org.assimbly.gateway.service.dto.TopicDTO;
import org.assimbly.gateway.service.mapper.TopicMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing {@link Topic}.
 */
@Service
@Transactional
public class TopicServiceImpl implements TopicService {

    private final Logger log = LoggerFactory.getLogger(TopicServiceImpl.class);

    private final TopicRepository topicRepository;

    private final TopicMapper topicMapper;

    public TopicServiceImpl(TopicRepository topicRepository, TopicMapper topicMapper) {
        this.topicRepository = topicRepository;
        this.topicMapper = topicMapper;
    }

    /**
     * Save a topic.
     *
     * @param topicDTO the entity to save.
     * @return the persisted entity.
     */
    @Override
    public TopicDTO save(TopicDTO topicDTO) {
        log.debug("Request to save Topic : {}", topicDTO);
        Topic topic = topicMapper.toEntity(topicDTO);
        topic = topicRepository.save(topic);
        return topicMapper.toDto(topic);
    }

    /**
     * Get all the topics.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<TopicDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Topics");
        return topicRepository.findAll(pageable)
            .map(topicMapper::toDto);
    }

    /**
     * Get one topic by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<TopicDTO> findOne(Long id) {
        log.debug("Request to get Topic : {}", id);
        return topicRepository.findById(id)
            .map(topicMapper::toDto);
    }

    /**
     * Delete the topic by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Topic : {}", id);
        topicRepository.deleteById(id);
    }
}
