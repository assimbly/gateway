package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Api;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data repository for the Api entity.
 */
@Repository
public interface ApiRepository extends JpaRepository<Api, Long> {

    List<Api> findAllByOrderByNameAsc();

    List<Api> findAllByIntegrationId(Long integrationId);

    Optional<Api> findByName(String name);
}
