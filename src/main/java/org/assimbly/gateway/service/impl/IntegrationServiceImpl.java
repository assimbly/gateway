package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.service.IntegrationService;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.dto.IntegrationDTO;
import org.assimbly.gateway.service.mapper.IntegrationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Integration.
 */
@Service
@Transactional
public class IntegrationServiceImpl implements IntegrationService {

    private final Logger log = LoggerFactory.getLogger(IntegrationServiceImpl.class);

    private final IntegrationRepository integrationRepository;

    private final IntegrationMapper integrationMapper;

    public IntegrationServiceImpl(IntegrationRepository integrationRepository, IntegrationMapper integrationMapper) {
        this.integrationRepository = integrationRepository;
        this.integrationMapper = integrationMapper;
    }

    /**
     * Save a integration.
     *
     * @param integrationDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public IntegrationDTO save(IntegrationDTO integrationDTO) {
        log.debug("Request to save Integration : {}", integrationDTO);

        Integration integration = integrationMapper.toEntity(integrationDTO);
        integration = integrationRepository.save(integration);
        return integrationMapper.toDto(integration);
    }

    /**
     * Get all the integrations.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<IntegrationDTO> findAll() {
        log.debug("Request to get all Integrations");
        return integrationRepository.findAll().stream()
            .map(integrationMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one integration by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<IntegrationDTO> findOne(Long id) {
        log.debug("Request to get Integration : {}", id);
        return integrationRepository.findById(id)
            .map(integrationMapper::toDto);
    }

    /**
     * Delete the integration by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Integration : {}", id);
        integrationRepository.deleteById(id);
    }
}
