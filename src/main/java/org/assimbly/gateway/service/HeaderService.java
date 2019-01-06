package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.service.dto.HeaderDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Header.
 */
public interface HeaderService {

    /**
     * Save a header.
     *
     * @param headerDTO the entity to save
     * @return the persisted entity
     */
    HeaderDTO save(HeaderDTO headerDTO);

    /**
     * Get all the headers.
     *
     * @return the list of entities
     */
    Page<HeaderDTO> findAll(Pageable pageable);
    


    /**
     * Get the "id" header.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<HeaderDTO> findOne(Long id);

    /**
     * Delete the "id" header.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
