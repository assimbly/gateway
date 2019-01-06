package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.GatewayService;
import org.assimbly.gateway.domain.Gateway;
import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.service.dto.GatewayDTO;
import org.assimbly.gateway.service.mapper.GatewayMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Gateway.
 */
@Service
@Transactional
public class GatewayServiceImpl implements GatewayService {

    private final Logger log = LoggerFactory.getLogger(GatewayServiceImpl.class);

    private final GatewayRepository gatewayRepository;

    private final GatewayMapper gatewayMapper;

    public GatewayServiceImpl(GatewayRepository gatewayRepository, GatewayMapper gatewayMapper) {
        this.gatewayRepository = gatewayRepository;
        this.gatewayMapper = gatewayMapper;
    }

    /**
     * Save a gateway.
     *
     * @param gatewayDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public GatewayDTO save(GatewayDTO gatewayDTO) {
        log.debug("Request to save Gateway : {}", gatewayDTO);

        Gateway gateway = gatewayMapper.toEntity(gatewayDTO);
        gateway = gatewayRepository.save(gateway);
        return gatewayMapper.toDto(gateway);
    }

    /**
     * Get all the gateways.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<GatewayDTO> findAll() {
        log.debug("Request to get all Gateways");
        return gatewayRepository.findAll().stream()
            .map(gatewayMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one gateway by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<GatewayDTO> findOne(Long id) {
        log.debug("Request to get Gateway : {}", id);
        return gatewayRepository.findById(id)
            .map(gatewayMapper::toDto);
    }

    /**
     * Delete the gateway by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Gateway : {}", id);
        gatewayRepository.deleteById(id);
    }
}
