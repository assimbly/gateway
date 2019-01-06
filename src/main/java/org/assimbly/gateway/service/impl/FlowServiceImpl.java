package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.FlowService;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.service.mapper.FlowMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing Flow.
 */
@Service
@Transactional
public class FlowServiceImpl implements FlowService {

    private final Logger log = LoggerFactory.getLogger(FlowServiceImpl.class);

    private final FlowRepository flowRepository;

    private final FlowMapper flowMapper;

    public FlowServiceImpl(FlowRepository flowRepository, FlowMapper flowMapper) {
        this.flowRepository = flowRepository;
        this.flowMapper = flowMapper;
    }

    /**
     * Save a flow.
     *
     * @param flowDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public FlowDTO save(FlowDTO flowDTO) {
        log.debug("Request to save Flow : {}", flowDTO);

        Flow flow = flowMapper.toEntity(flowDTO);
        flow = flowRepository.save(flow);
        return flowMapper.toDto(flow);
    }

    /**
     * Get all the flows.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<FlowDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Flows");
        return flowRepository.findAll(pageable)
            .map(flowMapper::toDto);
    }


    /**
     * Get one flow by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<FlowDTO> findOne(Long id) {
        log.debug("Request to get Flow : {}", id);
        return flowRepository.findById(id)
            .map(flowMapper::toDto);
    }

    /**
     * Delete the flow by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Flow : {}", id);
        flowRepository.deleteById(id);
    }

	@Override
	public Page<FlowDTO> findAllByGatewayId(Pageable pageable, Long gatewayid) {
		// TODO Auto-generated method stub
		return flowRepository.findAllByGatewayId(pageable, gatewayid);
	}
}
