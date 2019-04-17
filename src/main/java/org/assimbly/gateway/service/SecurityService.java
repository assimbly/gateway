package org.assimbly.gateway.service;

import org.assimbly.gateway.domain.Security;
import org.assimbly.gateway.service.dto.SecurityDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Security.
 */
public interface SecurityService {

    /**
     * Save a security.
     *
     * @param securityDTO the entity to save
     * @return the persisted entity
     */
    SecurityDTO save(SecurityDTO securityDTO);

    /**
     * Get all the securities.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    Page<SecurityDTO> findAll(Pageable pageable);


    /**
     * Get the "id" security.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<SecurityDTO> findOne(Long id);

    /**
     * Delete the "id" security.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

	List<Security> findAllByUrl(String url);

	List<Security> findAllByCertificateExpiryBetween(Instant dateNow, Instant dateOfExpiry);
}
