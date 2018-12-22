package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.ErrorEndpoint;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the ErrorEndpoint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ErrorEndpointRepository extends JpaRepository<ErrorEndpoint, Long> {

}
