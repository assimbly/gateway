package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.HeaderKeys;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the HeaderKeys entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HeaderKeysRepository extends JpaRepository<HeaderKeys, Long> {

}
