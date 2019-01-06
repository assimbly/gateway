package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.WireTapEndpoint;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the WireTapEndpoint entity.
 */
@SuppressWarnings("unused")
@Repository
public interface WireTapEndpointRepository extends JpaRepository<WireTapEndpoint, Long> {

}
