package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Step;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


/**
 * Spring Data  repository for the Step entity.
 */

@Repository
public interface StepRepository extends JpaRepository<Step, Long> {

	List<Step> findByFlowId(Long id);

}
