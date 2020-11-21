package org.assimbly.gateway.repository;

import java.util.List;

import org.assimbly.gateway.domain.Endpoint;
import org.assimbly.gateway.service.dto.EndpointDTO;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Endpoint entity.
 */

@Repository
public interface EndpointRepository extends JpaRepository<Endpoint, Long> {

	List<Endpoint> findByFlowId(Long id);

}
