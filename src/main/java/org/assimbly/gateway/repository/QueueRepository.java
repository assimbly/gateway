package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Queue;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data  repository for the Queue entity.
 */
@SuppressWarnings("unused")
@Repository
public interface QueueRepository extends JpaRepository<Queue, Long> {

}
