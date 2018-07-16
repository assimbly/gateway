package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.WireTapEndpoint;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the WireTapEndpoint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface WireTapEndpointRepository extends JpaRepository<WireTapEndpoint, Long> {

}
