package org.assimbly.gateway.service.dto;

import java.util.List;

/**
 * What a Flow needs to know when it is a Handler Flow: its API and Operation, the path the runtime serves it on,
 * the Operation's Declared response statuses, and its response media type.
 */
public record ApiHandlerDTO(
    Long apiId,
    String apiName,
    Long operationId,
    String method,
    String fullPath,
    String runtimePath,
    List<String> declaredStatuses,
    String responseMediaType
) {
}
