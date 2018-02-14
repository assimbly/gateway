package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.HeaderKeys;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the HeaderKeys entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HeaderKeysRepository extends JpaRepository<HeaderKeys, Long> {

}
