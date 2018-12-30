package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.ErrorEndpointService;
import org.assimbly.gateway.domain.ErrorEndpoint;
import org.assimbly.gateway.repository.ErrorEndpointRepository;
import org.assimbly.gateway.service.dto.ErrorEndpointDTO;
import org.assimbly.gateway.service.mapper.ErrorEndpointMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ErrorEndpoint.
 */
@Service
@Transactional
public class ErrorEndpointServiceImpl implements ErrorEndpointService {

    private final Logger log = LoggerFactory.getLogger(ErrorEndpointServiceImpl.class);

    private final ErrorEndpointRepository errorEndpointRepository;

    private final ErrorEndpointMapper errorEndpointMapper;

    public ErrorEndpointServiceImpl(ErrorEndpointRepository errorEndpointRepository, ErrorEndpointMapper errorEndpointMapper) {
        this.errorEndpointRepository = errorEndpointRepository;
        this.errorEndpointMapper = errorEndpointMapper;
    }

    /**
     * Save a errorEndpoint.
     *
     * @param errorEndpointDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public ErrorEndpointDTO save(ErrorEndpointDTO errorEndpointDTO) {
        log.debug("Request to save ErrorEndpoint : {}", errorEndpointDTO);

        ErrorEndpoint errorEndpoint = errorEndpointMapper.toEntity(errorEndpointDTO);
        errorEndpoint = errorEndpointRepository.save(errorEndpoint);
        return errorEndpointMapper.toDto(errorEndpoint);
    }

    /**
     * Get all the errorEndpoints.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<ErrorEndpointDTO> findAll() {
        log.debug("Request to get all ErrorEndpoints");
        return errorEndpointRepository.findAll().stream()
            .map(errorEndpointMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one errorEndpoint by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ErrorEndpointDTO> findOne(Long id) {
        log.debug("Request to get ErrorEndpoint : {}", id);
        return errorEndpointRepository.findById(id)
            .map(errorEndpointMapper::toDto);
    }

    /**
     * Delete the errorEndpoint by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete ErrorEndpoint : {}", id);
        errorEndpointRepository.deleteById(id);
    }
}
