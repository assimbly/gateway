package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Link;
import org.assimbly.gateway.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

/**
 * Spring Data  repository for the Link entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LinkRepository extends JpaRepository<Link, Long> {
    void deleteByStepId(Long stepId);

    Optional<Set<Link>> findByName(String name);

}
