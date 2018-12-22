package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.ErrorEndpoint;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the ErrorEndpoint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ErrorEndpointRepository extends JpaRepository<ErrorEndpoint, Long> {

}
