package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.service.StepService;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.gateway.service.dto.StepDTO;
import org.assimbly.gateway.service.mapper.StepMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Step.
 */
@Service
@Transactional
public class StepServiceImpl implements StepService {

    private final Logger log = LoggerFactory.getLogger(StepServiceImpl.class);

    private final StepRepository stepRepository;

    private final StepMapper stepMapper;

    public StepServiceImpl(StepRepository stepRepository, StepMapper stepMapper) {
        this.stepRepository = stepRepository;
        this.stepMapper = stepMapper;
    }

    /**
     * Save a step.
     *
     * @param stepDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public StepDTO save(StepDTO stepDTO) {
        log.debug("Request to save Step : {}", stepDTO);

        Step step = stepMapper.toEntity(stepDTO);
        step = stepRepository.save(step);
        return stepMapper.toDto(step);
    }

    /**
     * Get all the steps.
     *
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<StepDTO> findAll() {
        log.debug("Request to get all Steps");
        return stepRepository.findAll().stream()
            .map(stepMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get one step by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<StepDTO> findOne(Long id) {
        log.debug("Request to get Step by id: {}", id);
        return stepRepository.findById(id)
            .map(stepMapper::toDto);
    }


	@Override
	public List<Step> findByFlowId(Long id) {
        log.debug("Request to get Step : {}", id);
        return stepRepository.findByFlowId(id);
	}

    /**
     * Delete the step by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Step : {}", id);
        this.stepRepository.deleteById(id);
    }

}
