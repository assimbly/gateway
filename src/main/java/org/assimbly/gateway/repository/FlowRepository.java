package org.assimbly.gateway.repository;

import java.util.List;
import java.util.Optional;

import javax.persistence.OrderBy;

import org.assimbly.gateway.domain.Flow;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Spring Data  repository for the Flow entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FlowRepository extends JpaRepository<Flow, Long> {

	@OrderBy("name ASC")
	Page<Flow> findAllByIntegrationId(Pageable pageable, Long integrationid);

	@OrderBy("name ASC")
	List<Flow> findAllByIntegrationId(Long integrationid);

    Optional<Flow> findByName(String flowName);

}
