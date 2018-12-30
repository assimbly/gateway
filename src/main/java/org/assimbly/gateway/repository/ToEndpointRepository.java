package org.assimbly.gateway.repository;

import java.util.List;

import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.service.dto.ToEndpointDTO;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the ToEndpoint entity.
 */

@Repository
public interface ToEndpointRepository extends JpaRepository<ToEndpoint, Long> {

	List<ToEndpoint> findByFlowId(Long id);

}
