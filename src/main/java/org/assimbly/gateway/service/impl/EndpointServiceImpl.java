package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.EndpointService;
import org.assimbly.gateway.domain.Endpoint;
import org.assimbly.gateway.repository.EndpointRepository;
import org.assimbly.gateway.service.dto.EndpointDTO;
import org.assimbly.gateway.service.mapper.EndpointMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Endpoint.
 */
@Service
@Transactional
public class EndpointServiceImpl implements EndpointService {

    private final Logger log = LoggerFactory.getLogger(EndpointServiceImpl.class);

    private final EndpointRepository endpointRepository;

    private final EndpointMapper endpointMapper;

    public EndpointServiceImpl(EndpointRepository endpointRepository, EndpointMapper endpointMapper) {
        this.endpointRepository = endpointRepository;
        this.endpointMapper = endpointMapper;
    }

    /**
     * Save a endpoint.
     *
     * @param endpointDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public EndpointDTO save(EndpointDTO endpointDTO) {
        log.debug("Request to save Endpoint : {}", endpointDTO);

        Endpoint endpoint = endpointMapper.toEntity(endpointDTO);
        endpoint = endpointRepository.save(endpoint);
        return endpointMapper.toDto(endpoint);
    }

    /**
     * Get all the endpoints.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<EndpointDTO> findAll() {
        log.debug("Request to get all Endpoints");
        return endpointRepository.findAll().stream()
            .map(endpointMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one endpoint by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<EndpointDTO> findOne(Long id) {
        log.debug("Request to get Endpoint by id: {}", id);
        return endpointRepository.findById(id)
            .map(endpointMapper::toDto);
    }


	@Override
	public List<Endpoint> findByFlowId(Long id) {
        log.debug("Request to get Endpoint : {}", id);
        return endpointRepository.findByFlowId(id);
	}
    
    /**
     * Delete the endpoint by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Endpoint : {}", id);
        this.endpointRepository.deleteById(id);        
    }

}
