package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.WireTapEndpointService;
import org.assimbly.gateway.domain.WireTapEndpoint;
import org.assimbly.gateway.repository.WireTapEndpointRepository;
import org.assimbly.gateway.service.dto.WireTapEndpointDTO;
import org.assimbly.gateway.service.mapper.WireTapEndpointMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing WireTapEndpoint.
 */
@Service
@Transactional
public class WireTapEndpointServiceImpl implements WireTapEndpointService {

    private final Logger log = LoggerFactory.getLogger(WireTapEndpointServiceImpl.class);

    private final WireTapEndpointRepository wireTapEndpointRepository;

    private final WireTapEndpointMapper wireTapEndpointMapper;

    public WireTapEndpointServiceImpl(WireTapEndpointRepository wireTapEndpointRepository, WireTapEndpointMapper wireTapEndpointMapper) {
        this.wireTapEndpointRepository = wireTapEndpointRepository;
        this.wireTapEndpointMapper = wireTapEndpointMapper;
    }

    /**
     * Save a wireTapEndpoint.
     *
     * @param wireTapEndpointDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public WireTapEndpointDTO save(WireTapEndpointDTO wireTapEndpointDTO) {
        log.debug("Request to save WireTapEndpoint : {}", wireTapEndpointDTO);

        WireTapEndpoint wireTapEndpoint = wireTapEndpointMapper.toEntity(wireTapEndpointDTO);
        wireTapEndpoint = wireTapEndpointRepository.save(wireTapEndpoint);
        return wireTapEndpointMapper.toDto(wireTapEndpoint);
    }

    /**
     * Get all the wireTapEndpoints.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<WireTapEndpointDTO> findAll() {
        log.debug("Request to get all WireTapEndpoints");
        return wireTapEndpointRepository.findAll().stream()
            .map(wireTapEndpointMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one wireTapEndpoint by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<WireTapEndpointDTO> findOne(Long id) {
        log.debug("Request to get WireTapEndpoint : {}", id);
        return wireTapEndpointRepository.findById(id)
            .map(wireTapEndpointMapper::toDto);
    }

    /**
     * Delete the wireTapEndpoint by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete WireTapEndpoint : {}", id);
        wireTapEndpointRepository.deleteById(id);
    }
}
