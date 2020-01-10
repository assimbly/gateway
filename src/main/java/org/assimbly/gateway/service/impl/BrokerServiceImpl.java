package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.domain.Broker;
import org.assimbly.gateway.repository.BrokerRepository;
import org.assimbly.gateway.service.dto.BrokerDTO;
import org.assimbly.gateway.service.mapper.BrokerMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Broker.
 */
@Service
@Transactional
public class BrokerServiceImpl implements BrokerService {

    private final Logger log = LoggerFactory.getLogger(BrokerServiceImpl.class);

    private final BrokerRepository brokerRepository;

    private final BrokerMapper brokerMapper;

    public BrokerServiceImpl(BrokerRepository brokerRepository, BrokerMapper brokerMapper) {
        this.brokerRepository = brokerRepository;
        this.brokerMapper = brokerMapper;
    }

    /**
     * Save a broker.
     *
     * @param brokerDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public BrokerDTO save(BrokerDTO brokerDTO) {
        log.debug("Request to save Broker : {}", brokerDTO);

        Broker broker = brokerMapper.toEntity(brokerDTO);
        broker = brokerRepository.save(broker);
        return brokerMapper.toDto(broker);
    }

    /**
     * Get all the brokers.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<BrokerDTO> findAll() {
        log.debug("Request to get all Brokers");
        return brokerRepository.findAll().stream()
            .map(brokerMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one broker by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<BrokerDTO> findOne(Long id) {
        log.debug("Request to get Broker : {}", id);
        return brokerRepository.findById(id)
            .map(brokerMapper::toDto);
    }

    /**
     * Delete the broker by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Broker : {}", id);
        brokerRepository.deleteById(id);
    }
}
