package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


/**
 * Spring Data  repository for the Connection entity.
 */
@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

	Optional<Connection> findByName(String fromConnectionName);

}
