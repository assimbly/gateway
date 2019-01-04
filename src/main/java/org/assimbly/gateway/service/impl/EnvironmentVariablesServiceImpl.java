package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.EnvironmentVariablesService;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.service.dto.EnvironmentVariablesDTO;
import org.assimbly.gateway.service.mapper.EnvironmentVariablesMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing EnvironmentVariables.
 */
@Service
@Transactional
public class EnvironmentVariablesServiceImpl implements EnvironmentVariablesService {

    private final Logger log = LoggerFactory.getLogger(EnvironmentVariablesServiceImpl.class);

    private final EnvironmentVariablesRepository environmentVariablesRepository;

    private final EnvironmentVariablesMapper environmentVariablesMapper;

    public EnvironmentVariablesServiceImpl(EnvironmentVariablesRepository environmentVariablesRepository, EnvironmentVariablesMapper environmentVariablesMapper) {
        this.environmentVariablesRepository = environmentVariablesRepository;
        this.environmentVariablesMapper = environmentVariablesMapper;
    }

    /**
     * Save a environmentVariables.
     *
     * @param environmentVariablesDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public EnvironmentVariablesDTO save(EnvironmentVariablesDTO environmentVariablesDTO) {
        log.debug("Request to save EnvironmentVariables : {}", environmentVariablesDTO);

        EnvironmentVariables environmentVariables = environmentVariablesMapper.toEntity(environmentVariablesDTO);
        environmentVariables = environmentVariablesRepository.save(environmentVariables);
        return environmentVariablesMapper.toDto(environmentVariables);
    }

    /**
     * Get all the environmentVariables.
     *
     * @return the list of entities
     */
    
    @Override
    @Transactional(readOnly = true)
    public Page<EnvironmentVariablesDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Environment variables");
        return environmentVariablesRepository.findAll(pageable)
                .map(environmentVariablesMapper::toDto);
    }

    
    /**
     * Get one environmentVariables by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<EnvironmentVariablesDTO> findOne(Long id) {
        log.debug("Request to get EnvironmentVariables : {}", id);
        return environmentVariablesRepository.findById(id)
            .map(environmentVariablesMapper::toDto);
    }

    /**
     * Delete the environmentVariables by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete EnvironmentVariables : {}", id);
        environmentVariablesRepository.deleteById(id);
    }
}
