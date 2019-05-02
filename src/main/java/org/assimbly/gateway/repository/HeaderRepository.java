package org.assimbly.gateway.repository;

import java.util.Optional;

import org.assimbly.gateway.domain.Header;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Header entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HeaderRepository extends JpaRepository<Header, Long> {

	Optional<Header> findByName(String fromHeaderName);

}
