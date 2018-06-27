package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Maintenance;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the Maintenance entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

}
