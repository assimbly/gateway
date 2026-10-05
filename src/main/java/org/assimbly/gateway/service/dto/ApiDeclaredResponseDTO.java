package org.assimbly.gateway.service.dto;

/** A Declared response: a status from 100 to 599 or {@code default}, with a description and optional media type and schema. */
public record ApiDeclaredResponseDTO(String status, String description, String mediaType, String schema) {
}
