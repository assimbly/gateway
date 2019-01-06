package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.FromEndpoint;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the FromEndpoint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FromEndpointRepository extends JpaRepository<FromEndpoint, Long> {

}
