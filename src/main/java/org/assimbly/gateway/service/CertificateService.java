package org.assimbly.gateway.service;

import org.assimbly.gateway.domain.Certificate;
import org.assimbly.gateway.service.dto.CertificateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing Certificate.
 */
public interface CertificateService {

    /**
     * Save a certificate.
     *
     * @param certificateDTO the entity to save
     * @return the persisted entity
     */
    CertificateDTO save(CertificateDTO certificateDTO);

    /**
     * Get all the securities.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    Page<CertificateDTO> findAll(Pageable pageable);


    /**
     * Get the "id" certificate.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<CertificateDTO> findOne(Long id);

    /**
     * Delete the "id" certificate.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

	List<Certificate> findAll();
	
	List<Certificate> findAllByUrl(String url);

	List<Certificate> findAllByCertificateExpiryBetween(Instant dateNow, Instant dateOfExpiry);
	
	Optional<Certificate> findByCertificateName(String certificateName);


	
}
