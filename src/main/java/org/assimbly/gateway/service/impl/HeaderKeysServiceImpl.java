package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.HeaderKeysService;
import org.assimbly.gateway.domain.HeaderKeys;
import org.assimbly.gateway.repository.HeaderKeysRepository;
import org.assimbly.gateway.service.dto.HeaderKeysDTO;
import org.assimbly.gateway.service.mapper.HeaderKeysMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing HeaderKeys.
 */
@Service
@Transactional
public class HeaderKeysServiceImpl implements HeaderKeysService {

    private final Logger log = LoggerFactory.getLogger(HeaderKeysServiceImpl.class);

    private final HeaderKeysRepository headerKeysRepository;

    private final HeaderKeysMapper headerKeysMapper;

    public HeaderKeysServiceImpl(HeaderKeysRepository headerKeysRepository, HeaderKeysMapper headerKeysMapper) {
        this.headerKeysRepository = headerKeysRepository;
        this.headerKeysMapper = headerKeysMapper;
    }

    /**
     * Save a headerKeys.
     *
     * @param headerKeysDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public HeaderKeysDTO save(HeaderKeysDTO headerKeysDTO) {
        log.debug("Request to save HeaderKeys : {}", headerKeysDTO);

        HeaderKeys headerKeys = headerKeysMapper.toEntity(headerKeysDTO);
        headerKeys = headerKeysRepository.save(headerKeys);
        return headerKeysMapper.toDto(headerKeys);
    }

    /**
     * Get all the headerKeys.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<HeaderKeysDTO> findAll() {
        log.debug("Request to get all HeaderKeys");
        return headerKeysRepository.findAll().stream()
            .map(headerKeysMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one headerKeys by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<HeaderKeysDTO> findOne(Long id) {
        log.debug("Request to get HeaderKeys : {}", id);
        return headerKeysRepository.findById(id)
            .map(headerKeysMapper::toDto);
    }

    /**
     * Delete the headerKeys by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete HeaderKeys : {}", id);
        headerKeysRepository.deleteById(id);
    }
}
