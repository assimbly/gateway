package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Header;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the Header entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HeaderRepository extends JpaRepository<Header, Long> {

}
