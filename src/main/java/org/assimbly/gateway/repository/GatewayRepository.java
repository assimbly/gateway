package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Gateway;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Gateway entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GatewayRepository extends JpaRepository<Gateway, Long> {

}
