package org.assimbly.gateway.repository;

import java.util.List;

import org.assimbly.gateway.domain.Step;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Step entity.
 */

@Repository
public interface StepRepository extends JpaRepository<Step, Long> {

	List<Step> findByFlowId(Long id);

}
