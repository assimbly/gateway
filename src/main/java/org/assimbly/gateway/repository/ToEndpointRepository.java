package org.assimbly.gateway.repository;

import java.util.List;

import org.assimbly.gateway.domain.ToEndpoint;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the ToEndpoint entity.
 */

@Repository
public interface ToEndpointRepository extends JpaRepository<ToEndpoint, Long> {

	List<ToEndpoint> findByFlowId(Long id);

}
