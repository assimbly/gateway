package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.MaintenanceService;
import org.assimbly.gateway.domain.Maintenance;
import org.assimbly.gateway.repository.MaintenanceRepository;
import org.assimbly.gateway.service.dto.MaintenanceDTO;
import org.assimbly.gateway.service.mapper.MaintenanceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Maintenance.
 */
@Service
@Transactional
public class MaintenanceServiceImpl implements MaintenanceService {

    private final Logger log = LoggerFactory.getLogger(MaintenanceServiceImpl.class);

    private final MaintenanceRepository maintenanceRepository;

    private final MaintenanceMapper maintenanceMapper;

    public MaintenanceServiceImpl(MaintenanceRepository maintenanceRepository, MaintenanceMapper maintenanceMapper) {
        this.maintenanceRepository = maintenanceRepository;
        this.maintenanceMapper = maintenanceMapper;
    }

    /**
     * Save a maintenance.
     *
     * @param maintenanceDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public MaintenanceDTO save(MaintenanceDTO maintenanceDTO) {
        log.debug("Request to save Maintenance : {}", maintenanceDTO);

        Maintenance maintenance = maintenanceMapper.toEntity(maintenanceDTO);
        maintenance = maintenanceRepository.save(maintenance);
        return maintenanceMapper.toDto(maintenance);
    }

    /**
     * Get all the maintenances.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceDTO> findAll() {
        log.debug("Request to get all Maintenances");
        return maintenanceRepository.findAll().stream()
            .map(maintenanceMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one maintenance by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<MaintenanceDTO> findOne(Long id) {
        log.debug("Request to get Maintenance : {}", id);
        return maintenanceRepository.findById(id)
            .map(maintenanceMapper::toDto);
    }

    /**
     * Delete the maintenance by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Maintenance : {}", id);
        maintenanceRepository.deleteById(id);
    }
}
