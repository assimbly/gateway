package org.assimbly.gateway.service.dto;

/** A parameter of an Operation; {@code in} is path, query or header. */
public record ApiParameterDTO(String name, String in, String type, boolean required, String description) {
}
