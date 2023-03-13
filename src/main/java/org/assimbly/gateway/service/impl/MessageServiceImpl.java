package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.domain.Message;
import org.assimbly.gateway.repository.MessageRepository;
import org.assimbly.gateway.service.MessageService;
import org.assimbly.gateway.service.dto.MessageDTO;
import org.assimbly.gateway.service.mapper.MessageMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Message.
 */
@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    private final Logger log = LoggerFactory.getLogger(MessageServiceImpl.class);

    private final MessageRepository messageRepository;

    private final MessageMapper messageMapper;

    public MessageServiceImpl(MessageRepository messageRepository, MessageMapper messageMapper) {
        this.messageRepository = messageRepository;
        this.messageMapper = messageMapper;
    }

    /**
     * Save a message.
     *
     * @param messageDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public MessageDTO save(MessageDTO messageDTO) {
        log.debug("Request to save Message : {}", messageDTO);

        Message message = messageMapper.toEntity(messageDTO);
        message = messageRepository.save(message);
        return messageMapper.toDto(message);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Messages");
        return messageRepository.findAll(pageable)
            .map(messageMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTO> getAll() {
        log.debug("Request to get all Messages");
        return messageRepository.findAll().stream()
                .map(messageMapper::toDto)
                .collect(Collectors.toCollection(LinkedList::new));
    }



    /**
     * Get one message by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<MessageDTO> findOne(Long id) {
        log.debug("Request to get Message : {}", id);
        return messageRepository.findById(id)
            .map(messageMapper::toDto);
    }



    /**
     * Get one message by id.
     *
     * @param name the name of the message
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<MessageDTO> findByName(String name) {
        log.debug("Request to get Message by Name : {}", name);
        return messageRepository.findByName(name)
            .map(messageMapper::toDto);
    }


    /**
     * Delete the message by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Message : {}", id);
        messageRepository.deleteById(id);
    }
}
