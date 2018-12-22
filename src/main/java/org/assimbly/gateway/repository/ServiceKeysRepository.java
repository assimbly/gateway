package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.ServiceKeys;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the ServiceKeys entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ServiceKeysRepository extends JpaRepository<ServiceKeys, Long> {

}
