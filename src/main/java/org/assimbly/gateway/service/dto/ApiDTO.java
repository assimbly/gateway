package org.assimbly.gateway.service.dto;

import java.util.List;

/**
 * An API with its Operations. On the list of APIs the Operations are left out and only counted.
 */
public record ApiDTO(
    Long id,
    String name,
    String basePath,
    String versionLabel,
    String description,
    Long integrationId,
    int operationCount,
    List<ApiOperationDTO> operations
) {
}
