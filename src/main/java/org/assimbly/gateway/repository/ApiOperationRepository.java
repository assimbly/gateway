package org.assimbly.gateway.repository;

import org.assimbly.gateway.domain.ApiOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data repository for the ApiOperation entity.
 */
@Repository
public interface ApiOperationRepository extends JpaRepository<ApiOperation, Long> {

    /** The Operation a Flow handles; a Flow without one is not a Handler Flow. */
    Optional<ApiOperation> findByHandlerFlowId(Long flowId);
}
