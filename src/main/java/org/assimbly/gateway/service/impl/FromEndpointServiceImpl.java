package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.FromEndpointService;
import org.assimbly.gateway.domain.FromEndpoint;
import org.assimbly.gateway.repository.FromEndpointRepository;
import org.assimbly.gateway.service.dto.FromEndpointDTO;
import org.assimbly.gateway.service.mapper.FromEndpointMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing FromEndpoint.
 */
@Service
@Transactional
public class FromEndpointServiceImpl implements FromEndpointService {

    private final Logger log = LoggerFactory.getLogger(FromEndpointServiceImpl.class);

    private final FromEndpointRepository fromEndpointRepository;

    private final FromEndpointMapper fromEndpointMapper;

    public FromEndpointServiceImpl(FromEndpointRepository fromEndpointRepository, FromEndpointMapper fromEndpointMapper) {
        this.fromEndpointRepository = fromEndpointRepository;
        this.fromEndpointMapper = fromEndpointMapper;
    }

    /**
     * Save a fromEndpoint.
     *
     * @param fromEndpointDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public FromEndpointDTO save(FromEndpointDTO fromEndpointDTO) {
        log.debug("Request to save FromEndpoint : {}", fromEndpointDTO);

        FromEndpoint fromEndpoint = fromEndpointMapper.toEntity(fromEndpointDTO);
        fromEndpoint = fromEndpointRepository.save(fromEndpoint);
        return fromEndpointMapper.toDto(fromEndpoint);
    }

    /**
     * Get all the fromEndpoints.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<FromEndpointDTO> findAll() {
        log.debug("Request to get all FromEndpoints");
        return fromEndpointRepository.findAll().stream()
            .map(fromEndpointMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one fromEndpoint by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<FromEndpointDTO> findOne(Long id) {
        log.debug("Request to get FromEndpoint : {}", id);
        return fromEndpointRepository.findById(id)
            .map(fromEndpointMapper::toDto);
    }

    /**
     * Delete the fromEndpoint by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete FromEndpoint : {}", id);
        fromEndpointRepository.deleteById(id);
    }
}
