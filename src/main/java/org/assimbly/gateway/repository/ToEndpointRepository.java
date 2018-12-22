package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.ToEndpoint;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the ToEndpoint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ToEndpointRepository extends JpaRepository<ToEndpoint, Long> {

}
