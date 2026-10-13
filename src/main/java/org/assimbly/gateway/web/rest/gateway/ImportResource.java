package org.assimbly.gateway.web.rest.gateway;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.assimbly.gateway.service.dto.FlowImportResultDTO;
import org.assimbly.gateway.service.importing.FlowImportService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;

/**
 * REST controller that imports a Flow: from a DIL export (a Visual Flow, or whatever type the export says), from Camel
 * XML (a Route Flow) or from a script (a Script Flow). OpenAPI documents are imported by {@link ApiResource}.
 */
@Tag(name = "Import", description = "Import a Flow from DIL, Camel XML or a script")
@RestController
@RequestMapping("/api/import")
public class ImportResource {

    private final FlowImportService flowImportService;

    public ImportResource(FlowImportService flowImportService) {
        this.flowImportService = flowImportService;
    }

    @Operation(summary = "Import a Flow from a DIL export; a Flow with the same name is replaced unless onConflict=rename")
    @PostMapping(path = "/flow", consumes = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE, MediaType.TEXT_PLAIN_VALUE, MediaType.APPLICATION_JSON_VALUE, "application/yaml", "text/yaml"})
    public FlowImportResultDTO importFlow(
        @RequestBody String configuration,
        @RequestParam(value = "integrationId", required = false) Long integrationId,
        @RequestParam(value = "onConflict", defaultValue = "replace") String onConflict,
        @RequestHeader(value = "Content-Type", defaultValue = MediaType.APPLICATION_XML_VALUE) String contentType
    ) {
        return flowImportService.importDil(integrationId, mediaType(contentType), configuration, "rename".equalsIgnoreCase(onConflict));
    }

    @Operation(summary = "Import Camel XML (route, routes or camelContext) as a new Route Flow")
    @PostMapping(path = "/camel", consumes = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE, MediaType.TEXT_PLAIN_VALUE})
    public FlowImportResultDTO importCamel(
        @RequestBody String xml,
        @RequestParam(value = "integrationId", required = false) Long integrationId,
        @RequestParam(value = "name", required = false) String name
    ) {
        return flowImportService.importCamel(integrationId, xml, name);
    }

    @Operation(summary = "Import a script as a new Script Flow")
    @PostMapping(path = "/script", consumes = {MediaType.TEXT_PLAIN_VALUE, MediaType.APPLICATION_OCTET_STREAM_VALUE})
    public FlowImportResultDTO importScript(
        @RequestBody String script,
        @RequestParam("language") String language,
        @RequestParam(value = "integrationId", required = false) Long integrationId,
        @RequestParam(value = "name", required = false) String name
    ) {
        return flowImportService.importScript(integrationId, script, language, name);
    }

    /** The format of a DIL document as the importer reads it; plain text is XML here. */
    private static String mediaType(String contentType) {
        String lowerCase = contentType.toLowerCase(Locale.ROOT);
        if (lowerCase.contains("json")) {
            return MediaType.APPLICATION_JSON_VALUE;
        }
        if (lowerCase.contains("yaml")) {
            return "application/yaml";
        }
        return MediaType.APPLICATION_XML_VALUE;
    }
}
