package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;


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
