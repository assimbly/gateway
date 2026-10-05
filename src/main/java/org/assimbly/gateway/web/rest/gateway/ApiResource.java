package org.assimbly.gateway.web.rest.gateway;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.service.api.ApiService;
import org.assimbly.gateway.service.api.ApiTryService;
import org.assimbly.gateway.service.api.OpenApiService;
import org.assimbly.gateway.service.dto.ApiDTO;
import org.assimbly.gateway.service.dto.ApiHandlerDTO;
import org.assimbly.gateway.service.dto.ApiImportResultDTO;
import org.assimbly.gateway.service.dto.ApiOperationDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

/**
 * REST controller for APIs and their Operations (docs/specs/rest-api-builder.md). Creating an Operation creates its
 * Handler Flow, and deleting one deletes it. Starting and stopping an API is done Flow by Flow from the UI, which
 * knows which Handler Flows are Drafts.
 */
@Tag(name = "APIs", description = "Design REST APIs: Operations, their contract and Handler Flows")
@RestController
@RequestMapping("/api")
public class ApiResource {

    private final Logger log = LoggerFactory.getLogger(ApiResource.class);

    private final ApiService apiService;
    private final OpenApiService openApiService;
    private final ApiTryService apiTryService;
    private final ApplicationProperties applicationProperties;

    public ApiResource(ApiService apiService, OpenApiService openApiService, ApiTryService apiTryService, ApplicationProperties applicationProperties) {
        this.apiService = apiService;
        this.openApiService = openApiService;
        this.apiTryService = apiTryService;
        this.applicationProperties = applicationProperties;
    }

    @Operation(summary = "List APIs")
    @GetMapping("/apis")
    public List<ApiDTO> getApis() {
        return apiService.findAll();
    }

    @Operation(summary = "Get an API with its Operations")
    @GetMapping("/apis/{id}")
    public ResponseEntity<ApiDTO> getApi(@PathVariable Long id) {
        return ResponseUtil.wrapOrNotFound(apiService.findOne(id));
    }

    @Operation(summary = "Create an API")
    @PostMapping("/apis")
    public ResponseEntity<ApiDTO> createApi(@RequestBody ApiDTO api) throws URISyntaxException {
        log.debug("REST request to create API : {}", api.name());
        ApiDTO created = apiService.createApi(api);
        return ResponseEntity.created(new URI("/api/apis/" + created.id())).body(created);
    }

    @Operation(summary = "Update an API")
    @PutMapping("/apis/{id}")
    public ApiDTO updateApi(@PathVariable Long id, @RequestBody ApiDTO api) {
        log.debug("REST request to update API : {}", id);
        return apiService.updateApi(id, api);
    }

    @Operation(summary = "Delete an API, with its Operations and their Handler Flows")
    @DeleteMapping("/apis/{id}")
    public ResponseEntity<Void> deleteApi(@PathVariable Long id) {
        log.debug("REST request to delete API : {}", id);
        apiService.deleteApi(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Add an Operation, with its Handler Flow")
    @PostMapping("/apis/{id}/operations")
    public ResponseEntity<ApiOperationDTO> createOperation(@PathVariable Long id, @RequestBody ApiOperationDTO operation) throws URISyntaxException {
        ApiOperationDTO created = apiService.createOperation(id, operation);
        return ResponseEntity.created(new URI("/api/apis/" + id + "/operations/" + created.id())).body(created);
    }

    @Operation(summary = "Update an Operation; its Handler Flow's Source follows")
    @PutMapping("/apis/{id}/operations/{operationId}")
    public ApiOperationDTO updateOperation(@PathVariable Long id, @PathVariable Long operationId, @RequestBody ApiOperationDTO operation) {
        return apiService.updateOperation(id, operationId, operation);
    }

    @Operation(summary = "Delete an Operation and its Handler Flow")
    @DeleteMapping("/apis/{id}/operations/{operationId}")
    public ResponseEntity<Void> deleteOperation(@PathVariable Long id, @PathVariable Long operationId) {
        apiService.deleteOperation(id, operationId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Send a request to an Operation through its path on the runtime")
    @PostMapping("/apis/{id}/operations/{operationId}/try")
    public ApiTryService.TryResponse tryOperation(@PathVariable Long id, @PathVariable Long operationId, @RequestBody ApiTryService.TryRequest request) {
        return apiTryService.send(id, operationId, request);
    }

    @Operation(summary = "Import an OpenAPI 3.0 or 3.1 document (JSON or YAML) as a new API")
    @PostMapping(path = "/apis/import", consumes = {MediaType.TEXT_PLAIN_VALUE, "application/yaml", "text/yaml", MediaType.APPLICATION_JSON_VALUE})
    public ApiImportResultDTO importApi(@RequestBody String document, @RequestParam(value = "integrationId", required = false) Long integrationId) {
        return openApiService.importDocument(document, integrationId);
    }

    @Operation(summary = "Export an API as an OpenAPI 3.0.3 document")
    @GetMapping("/apis/{id}/openapi")
    public ResponseEntity<String> exportApi(@PathVariable Long id, @RequestParam(value = "format", defaultValue = "yaml") String format,
                                            HttpServletRequest request) {
        boolean json = "json".equalsIgnoreCase(format);
        String document = openApiService.exportDocument(id, json ? "json" : "yaml", listenerUrl(request));
        String name = apiService.findOne(id).map(ApiDTO::name).orElse("api").replaceAll("[^A-Za-z0-9._-]+", "-");
        return ResponseEntity.ok()
            .contentType(json ? MediaType.APPLICATION_JSON : MediaType.parseMediaType("application/yaml"))
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(name + "-openapi." + (json ? "json" : "yaml")).build().toString())
            .body(document);
    }

    @Operation(summary = "The Handler Flows, by Flow id, with their API and Operation")
    @GetMapping("/apis/handlers")
    public Map<Long, ApiHandlerDTO> getHandlers() {
        return apiService.handlers();
    }

    @Operation(summary = "The API and Operation a Flow handles, if it is a Handler Flow")
    @GetMapping("/apis/handlers/{flowId}")
    public ResponseEntity<ApiHandlerDTO> getHandler(@PathVariable Long flowId) {
        return ResponseUtil.wrapOrNotFound(apiService.handlerOf(flowId));
    }

    @Operation(summary = "The runtime's REST listener as callers reach it; an Operation's URL is this and its runtime path")
    @GetMapping("/apis/listener")
    public Map<String, String> getListener(HttpServletRequest request) {
        return Map.of("url", listenerUrl(request));
    }

    /** The runtime's REST listener as callers reach it: this Gateway's host on the listener's port. */
    private String listenerUrl(HttpServletRequest request) {
        URI listener = URI.create(applicationProperties.getGateway().getRestListenerUrl());
        return listener.getScheme() + "://" + request.getServerName() + (listener.getPort() > 0 ? ":" + listener.getPort() : "");
    }
}
