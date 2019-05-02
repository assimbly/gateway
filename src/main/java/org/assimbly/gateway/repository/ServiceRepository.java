package org.assimbly.gateway.repository;

import java.util.Optional;

import org.assimbly.gateway.domain.Service;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Service entity.
 */
@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

	Optional<Service> findByName(String fromServiceName);

}
