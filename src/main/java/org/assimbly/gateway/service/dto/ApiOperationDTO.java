package org.assimbly.gateway.service.dto;

import java.util.List;

/**
 * An Operation with its contract and Handler Flow. {@code fullPath} (base path + path) and the Handler Flow fields
 * are read-only; {@code flowType} is only read when the Operation is created ({@code flow} or {@code script}).
 */
public record ApiOperationDTO(
    Long id,
    Long apiId,
    String method,
    String path,
    String fullPath,
    String operationId,
    String summary,
    String description,
    String requestMediaType,
    String responseMediaType,
    String requestSchema,
    List<ApiParameterDTO> parameters,
    List<ApiDeclaredResponseDTO> declaredResponses,
    Long handlerFlowId,
    String handlerFlowName,
    String flowType
) {
}
