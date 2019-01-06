package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.ServiceService;
import org.assimbly.gateway.repository.ServiceRepository;
import org.assimbly.gateway.service.dto.HeaderDTO;
import org.assimbly.gateway.service.dto.ServiceDTO;
import org.assimbly.gateway.service.mapper.ServiceMapper;
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
 * Service Implementation for managing Service.
 */
@Service
@Transactional
public class ServiceServiceImpl implements ServiceService {

    private final Logger log = LoggerFactory.getLogger(ServiceServiceImpl.class);

    private final ServiceRepository serviceRepository;

    private final ServiceMapper serviceMapper;

    public ServiceServiceImpl(ServiceRepository serviceRepository, ServiceMapper serviceMapper) {
        this.serviceRepository = serviceRepository;
        this.serviceMapper = serviceMapper;
    }

    /**
     * Save a service.
     *
     * @param serviceDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public ServiceDTO save(ServiceDTO serviceDTO) {
        log.debug("Request to save Service : {}", serviceDTO);

        org.assimbly.gateway.domain.Service service = serviceMapper.toEntity(serviceDTO);
        service = serviceRepository.save(service);
        return serviceMapper.toDto(service);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ServiceDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Headers");
        return serviceRepository.findAll(pageable)
            .map(serviceMapper::toDto);
    }

    /**
     * Get one service by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ServiceDTO> findOne(Long id) {
        log.debug("Request to get Service : {}", id);
        return serviceRepository.findById(id)
            .map(serviceMapper::toDto);
    }

    /**
     * Delete the service by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Service : {}", id);
        serviceRepository.deleteById(id);
    }
}
