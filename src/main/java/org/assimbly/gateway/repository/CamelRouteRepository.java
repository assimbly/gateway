package org.assimbly.gateway.repository;

import java.util.List;

import org.assimbly.gateway.domain.CamelRoute;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the CamelRoute entity.
 */
@Repository
public interface CamelRouteRepository extends JpaRepository<CamelRoute, Long> {

	List<CamelRoute> findAllByGatewayId(Long gatewayid);

}
