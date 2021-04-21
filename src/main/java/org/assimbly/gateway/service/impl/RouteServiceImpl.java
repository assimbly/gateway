package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.RouteService;
import org.assimbly.gateway.domain.Route;
import org.assimbly.gateway.repository.RouteRepository;
import org.assimbly.gateway.service.dto.RouteDTO;
import org.assimbly.gateway.service.mapper.RouteMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing {@link Route}.
 */
@Service
@Transactional
public class RouteServiceImpl implements RouteService {

    private final Logger log = LoggerFactory.getLogger(RouteServiceImpl.class);

    private final RouteRepository routeRepository;

    private final RouteMapper routeMapper;

    public RouteServiceImpl(RouteRepository routeRepository, RouteMapper routeMapper) {
        this.routeRepository = routeRepository;
        this.routeMapper = routeMapper;
    }

    /**
     * Save a route.
     *
     * @param routeDTO the entity to save.
     * @return the persisted entity.
     */
    @Override
    public RouteDTO save(RouteDTO routeDTO) {
        log.debug("Request to save Route : {}", routeDTO);
        Route route = routeMapper.toEntity(routeDTO);
        route = routeRepository.save(route);
        return routeMapper.toDto(route);
    }

    /**
     * Get all the routes.
     *
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<RouteDTO> findAll() {
        log.debug("Request to get all Routes");
        return routeRepository.findAll().stream()
            .map(routeMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one route by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<RouteDTO> findOne(Long id) {
        log.debug("Request to get Route : {}", id);
        return routeRepository.findById(id)
            .map(routeMapper::toDto);
    }

    /**
     * Delete the route by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Route : {}", id);
        routeRepository.deleteById(id);
    }
}
