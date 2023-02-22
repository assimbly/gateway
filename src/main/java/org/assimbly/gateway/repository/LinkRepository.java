package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Link;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data  repository for the HeaderKeys entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LinkRepository extends JpaRepository<Link, Long> {

}
