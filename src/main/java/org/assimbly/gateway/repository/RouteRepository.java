package org.assimbly.gateway.repository;

import java.util.Optional;

import org.assimbly.gateway.domain.Route;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data  repository for the Route entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

	Optional<Route> findByName(String name);

    Optional<Route> findById(Long id);
	
}
