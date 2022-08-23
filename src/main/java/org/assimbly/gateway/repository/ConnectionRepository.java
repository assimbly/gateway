package org.assimbly.gateway.repository;

import java.util.Optional;

import org.assimbly.gateway.domain.Connection;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Connection entity.
 */
@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

	Optional<Connection> findByName(String fromConnectionName);

}
