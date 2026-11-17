package org.assimbly.gateway.service.dto;

import java.util.List;

/**
 * The Flow an import created (or replaced) and what to tell the user about it.
 *
 * @param flowId   id of the Flow, to open it in an editor
 * @param name     name of the Flow
 * @param type     type of the Flow: {@code flow} (Visual), {@code route} or {@code script}
 * @param replaced whether the import replaced an existing Flow with the same name
 * @param warnings parts of the input that were not brought across, or that deserve a second look
 */
public record FlowImportResultDTO(Long flowId, String name, String type, boolean replaced, List<String> warnings) {
}
