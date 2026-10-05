package org.assimbly.gateway.service.dto;

import java.util.List;

/** The API an OpenAPI import created, and every part of the document it didn't bring across. */
public record ApiImportResultDTO(ApiDTO api, List<String> dropped) {
}
