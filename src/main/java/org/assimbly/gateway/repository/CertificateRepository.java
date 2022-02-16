package org.assimbly.gateway.repository;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import javax.persistence.OrderBy;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Certificate;
import org.assimbly.gateway.domain.Service;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Certificate entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
	
	List<Certificate> findAllByCertificateExpiryBetween(Instant now, Instant expiryDate);
	
	List<Certificate> findAllByUrl(String url);
	
	Optional<Certificate> findByCertificateName(String certificateName);
	
}
