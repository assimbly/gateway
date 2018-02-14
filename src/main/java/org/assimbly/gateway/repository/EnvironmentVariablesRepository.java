package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.EnvironmentVariables;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the EnvironmentVariables entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EnvironmentVariablesRepository extends JpaRepository<EnvironmentVariables, Long> {

}
