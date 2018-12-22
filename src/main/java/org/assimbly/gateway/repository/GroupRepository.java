package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Group entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query(value = "select distinct jhi_group from Group jhi_group left join fetch jhi_group.users",
        countQuery = "select count(distinct jhi_group) from Group jhi_group")
    Page<Group> findAllWithEagerRelationships(Pageable pageable);

    @Query(value = "select distinct jhi_group from Group jhi_group left join fetch jhi_group.users")
    List<Group> findAllWithEagerRelationships();

    @Query("select jhi_group from Group jhi_group left join fetch jhi_group.users where jhi_group.id =:id")
    Optional<Group> findOneWithEagerRelationships(@Param("id") Long id);

}
