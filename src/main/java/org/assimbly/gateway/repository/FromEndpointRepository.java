package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.FromEndpoint;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the FromEndpoint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FromEndpointRepository extends JpaRepository<FromEndpoint, Long> {

}
