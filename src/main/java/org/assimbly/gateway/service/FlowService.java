package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.FlowDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * Service Interface for managing Flow.
 */
public interface FlowService {

    /**
     * Save a flow.
     *
     * @param flowDTO the entity to save
     * @return the persisted entity
     */
    FlowDTO save(FlowDTO flowDTO);

    /**
     * Get all the flows.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    Page<FlowDTO> findAll(Pageable pageable);


    /**
     * Get the "id" flow.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<FlowDTO> findOne(Long id);

    /**
     * Delete the "id" flow.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

	Page<FlowDTO> findAllByGatewayId(Pageable pageable, Long gatewayid);
}
