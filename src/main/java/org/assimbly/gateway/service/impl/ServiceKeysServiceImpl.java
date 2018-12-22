package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.ServiceKeysService;
import org.assimbly.gateway.domain.ServiceKeys;
import org.assimbly.gateway.repository.ServiceKeysRepository;
import org.assimbly.gateway.service.dto.ServiceKeysDTO;
import org.assimbly.gateway.service.mapper.ServiceKeysMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ServiceKeys.
 */
@Service
@Transactional
public class ServiceKeysServiceImpl implements ServiceKeysService {

    private final Logger log = LoggerFactory.getLogger(ServiceKeysServiceImpl.class);

    private final ServiceKeysRepository serviceKeysRepository;

    private final ServiceKeysMapper serviceKeysMapper;

    public ServiceKeysServiceImpl(ServiceKeysRepository serviceKeysRepository, ServiceKeysMapper serviceKeysMapper) {
        this.serviceKeysRepository = serviceKeysRepository;
        this.serviceKeysMapper = serviceKeysMapper;
    }

    /**
     * Save a serviceKeys.
     *
     * @param serviceKeysDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public ServiceKeysDTO save(ServiceKeysDTO serviceKeysDTO) {
        log.debug("Request to save ServiceKeys : {}", serviceKeysDTO);
        ServiceKeys serviceKeys = serviceKeysMapper.toEntity(serviceKeysDTO);
        serviceKeys = serviceKeysRepository.save(serviceKeys);
        return serviceKeysMapper.toDto(serviceKeys);
    }

    /**
     * Get all the serviceKeys.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceKeysDTO> findAll() {
        log.debug("Request to get all ServiceKeys");
        return serviceKeysRepository.findAll().stream()
            .map(serviceKeysMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one serviceKeys by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public ServiceKeysDTO findOne(Long id) {
        log.debug("Request to get ServiceKeys : {}", id);
        ServiceKeys serviceKeys = serviceKeysRepository.findOne(id);
        return serviceKeysMapper.toDto(serviceKeys);
    }

    /**
     * Delete the serviceKeys by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete ServiceKeys : {}", id);
        serviceKeysRepository.delete(id);
    }
}
