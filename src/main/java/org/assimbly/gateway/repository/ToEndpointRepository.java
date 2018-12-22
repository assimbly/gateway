package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.ToEndpoint;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the ToEndpoint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ToEndpointRepository extends JpaRepository<ToEndpoint, Long> {

}
