package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Flow;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Flow entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FlowRepository extends JpaRepository<Flow, Long> {

}
