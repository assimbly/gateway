package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.domain.Connection;
import org.assimbly.gateway.service.ConnectionService;
import org.assimbly.gateway.repository.ConnectionRepository;
import org.assimbly.gateway.service.dto.ConnectionDTO;
import org.assimbly.gateway.service.mapper.ConnectionMapper;
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
 * Service Implementation for managing Connection.
 */
@Service
@Transactional
public class ConnectionServiceImpl implements ConnectionService {

    private final Logger log = LoggerFactory.getLogger(ConnectionServiceImpl.class);

    private final ConnectionRepository connectionRepository;

    private final ConnectionMapper connectionMapper;

    public ConnectionServiceImpl(ConnectionRepository connectionRepository, ConnectionMapper connectionMapper) {
        this.connectionRepository = connectionRepository;
        this.connectionMapper = connectionMapper;
    }

    /**
     * Save a connection.
     *
     * @param connectionDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public ConnectionDTO save(ConnectionDTO connectionDTO) {
        log.debug("Request to save Connection : {}", connectionDTO);

        Connection connection = connectionMapper.toEntity(connectionDTO);
        connection = connectionRepository.save(connection);
        return connectionMapper.toDto(connection);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConnectionDTO> findAll(Pageable pageable) {
        log.debug("Request to get all connections");
        return connectionRepository.findAll(pageable)
            .map(connectionMapper::toDto);
    }

    /**
     * Get one connection by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ConnectionDTO> findOne(Long id) {
        log.debug("Request to get Connection : {}", id);
        return connectionRepository.findById(id)
            .map(connectionMapper::toDto);
    }


    @Override
    @Transactional(readOnly = true)
    public List<ConnectionDTO> getAll() {
        log.debug("Request to get all Connections");
        return connectionRepository.findAll().stream()
                .map(connectionMapper::toDto)
                .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Delete the connection by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Connection : {}", id);
        connectionRepository.deleteById(id);
    }
}
