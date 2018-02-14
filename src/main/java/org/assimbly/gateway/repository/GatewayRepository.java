package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Gateway;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the Gateway entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GatewayRepository extends JpaRepository<Gateway, Long> {

}
