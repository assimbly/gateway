package org.assimbly.gateway.repository;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import javax.persistence.OrderBy;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Security;
import org.assimbly.gateway.domain.Service;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Security entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SecurityRepository extends JpaRepository<Security, Long> {
	
	List<Security> findAllByCertificateExpiryBetween(Instant now, Instant expiryDate);
	
	List<Security> findAllByUrl(String url);
	
	Optional<Security> findByCertificateName(String certificateName);
	
}