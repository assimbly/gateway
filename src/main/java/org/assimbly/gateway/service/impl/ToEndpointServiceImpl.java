package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.ToEndpointService;
import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.repository.ToEndpointRepository;
import org.assimbly.gateway.service.dto.ToEndpointDTO;
import org.assimbly.gateway.service.mapper.ToEndpointMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ToEndpoint.
 */
@Service
@Transactional
public class ToEndpointServiceImpl implements ToEndpointService {

    private final Logger log = LoggerFactory.getLogger(ToEndpointServiceImpl.class);

    private final ToEndpointRepository toEndpointRepository;

    private final ToEndpointMapper toEndpointMapper;

    public ToEndpointServiceImpl(ToEndpointRepository toEndpointRepository, ToEndpointMapper toEndpointMapper) {
        this.toEndpointRepository = toEndpointRepository;
        this.toEndpointMapper = toEndpointMapper;
    }

    /**
     * Save a toEndpoint.
     *
     * @param toEndpointDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public ToEndpointDTO save(ToEndpointDTO toEndpointDTO) {
        log.debug("Request to save ToEndpoint : {}", toEndpointDTO);

        ToEndpoint toEndpoint = toEndpointMapper.toEntity(toEndpointDTO);
        toEndpoint = toEndpointRepository.save(toEndpoint);
        return toEndpointMapper.toDto(toEndpoint);
    }

    /**
     * Get all the toEndpoints.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<ToEndpointDTO> findAll() {
        log.debug("Request to get all ToEndpoints");
        return toEndpointRepository.findAll().stream()
            .map(toEndpointMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one toEndpoint by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ToEndpointDTO> findOne(Long id) {
        log.debug("Request to get ToEndpoint by id: {}", id);
        return toEndpointRepository.findById(id)
            .map(toEndpointMapper::toDto);
    }


	@Override
	public List<ToEndpoint> findByFlowId(Long id) {
        log.debug("Request to get ToEndpoint : {}", id);
        return toEndpointRepository.findByFlowId(id);
	}
    
    /**
     * Delete the toEndpoint by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete ToEndpoint : {}", id);
        this.toEndpointRepository.deleteById(id);        
    }

}
