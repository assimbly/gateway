package org.assimbly.gateway.repository;

import java.util.List;

import org.assimbly.gateway.domain.Flow;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the Flow entity.
 */
@Repository
public interface FlowRepository extends JpaRepository<Flow, Long> {

	List<Flow> findAllByGatewayId(Long gatewayid);

}
