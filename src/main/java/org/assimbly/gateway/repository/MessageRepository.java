package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


/**
 * Spring Data  repository for the Message entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

	Optional<Message> findByName(String name);

    Optional<Message> findById(Long id);

}
