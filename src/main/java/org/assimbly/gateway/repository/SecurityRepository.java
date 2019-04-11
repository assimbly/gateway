package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Security;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Security entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SecurityRepository extends JpaRepository<Security, Long> {

}
