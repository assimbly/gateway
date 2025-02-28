package org.assimbly.gateway.repository;

import jakarta.persistence.OrderBy;
import org.assimbly.gateway.domain.Flow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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
