package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.ConnectionKeysService;
import org.assimbly.gateway.domain.ConnectionKeys;
import org.assimbly.gateway.repository.ConnectionKeysRepository;
import org.assimbly.gateway.service.dto.ConnectionKeysDTO;
import org.assimbly.gateway.service.mapper.ConnectionKeysMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ConnectionKeys.
 */
@Service
@Transactional
public class ConnectionKeysServiceImpl implements ConnectionKeysService {

    private final Logger log = LoggerFactory.getLogger(ConnectionKeysServiceImpl.class);

    private final ConnectionKeysRepository connectionKeysRepository;

    private final ConnectionKeysMapper connectionKeysMapper;

    public ConnectionKeysServiceImpl(ConnectionKeysRepository connectionKeysRepository, ConnectionKeysMapper connectionKeysMapper) {
        this.connectionKeysRepository = connectionKeysRepository;
        this.connectionKeysMapper = connectionKeysMapper;
    }

    /**
     * Save a connectionKeys.
     *
     * @param connectionKeysDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public ConnectionKeysDTO save(ConnectionKeysDTO connectionKeysDTO) {
        log.debug("Request to save ConnectionKeys : {}", connectionKeysDTO);

        ConnectionKeys connectionKeys = connectionKeysMapper.toEntity(connectionKeysDTO);
        connectionKeys = connectionKeysRepository.save(connectionKeys);

        return connectionKeysMapper.toDto(connectionKeys);
    }

    /**
     * Get all the connectionKeys.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<ConnectionKeysDTO> findAll() {
        log.debug("Request to get all ConnectionKeys");
        return connectionKeysRepository.findAll().stream()
            .map(connectionKeysMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one connectionKeys by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ConnectionKeysDTO> findOne(Long id) {
        log.debug("Request to get ConnectionKeys : {}", id);
        return connectionKeysRepository.findById(id)
            .map(connectionKeysMapper::toDto);
    }

    /**
     * Delete the connectionKeys by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete ConnectionKeys : {}", id);
        connectionKeysRepository.deleteById(id);
    }
}
