package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.ServiceKeys;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the ServiceKeys entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ServiceKeysRepository extends JpaRepository<ServiceKeys, Long> {

}
