package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.ConnectionKeys;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the ConnectionKeys entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ConnectionKeysRepository extends JpaRepository<ConnectionKeys, Long> {

}
