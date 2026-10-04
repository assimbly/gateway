package org.assimbly.gateway.service.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.swagger.v3.core.util.Json;
import io.swagger.v3.core.util.Yaml;
import io.swagger.v3.parser.OpenAPIV3Parser;
import io.swagger.v3.parser.core.models.ParseOptions;
import io.swagger.v3.parser.core.models.SwaggerParseResult;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.service.dto.ApiDTO;
import org.assimbly.gateway.service.dto.ApiDeclaredResponseDTO;
import org.assimbly.gateway.service.dto.ApiImportResultDTO;
import org.assimbly.gateway.service.dto.ApiOperationDTO;
import org.assimbly.gateway.service.dto.ApiParameterDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Turns an OpenAPI 3.0 or 3.1 document into a new API, and an API into an OpenAPI 3.0.3 document (ADR 0004).
 * The API model is the source of truth: an import maps the document into it once and lists what it dropped; an export
 * is generated from it. Request and response schemas are kept as the document has them, with local $refs resolved,
 * so they export unchanged.
 */
@Service
@Transactional
public class OpenApiService {

    private static final String PROBLEM_MEDIA_TYPE = "application/problem+json";

    /** Reads YAML and JSON alike; writes YAML. */
    private static final ObjectMapper YAML = Yaml.mapper();
    private static final ObjectMapper JSON = Json.mapper();

    private static final Set<String> OPERATION_KEYS = Set.of("operationId", "summary", "description", "parameters", "requestBody", "responses");
    /** The keys of a parameter the model holds; its examples are listed as dropped on their own. */
    private static final Set<String> PARAMETER_KEYS = Set.of("name", "in", "required", "description", "schema", "example", "examples");
    private static final Set<String> MEDIA_TYPE_KEYS = Set.of("schema");
    private static final Set<String> RESPONSE_KEYS = Set.of("description", "content", "headers", "$ref");
    private static final Set<String> REQUEST_BODY_KEYS = Set.of("content", "$ref");
    private static final Set<String> RESOLVED_COMPONENTS = Set.of("schemas", "parameters", "requestBodies", "responses");

    private final ApiService apiService;
    private final ApplicationProperties applicationProperties;

    public OpenApiService(ApiService apiService, ApplicationProperties applicationProperties) {
        this.apiService = apiService;
        this.applicationProperties = applicationProperties;
    }

    /**
     * Creates an API from the document, with one Draft Handler Flow per Operation. The whole import is refused when
     * any of its Operations clashes with an existing one.
     */
    public ApiImportResultDTO importDocument(String text, Long integrationId) {
        JsonNode root = read(text);
        List<String> dropped = new ArrayList<>();
        Document document = new Document(root, dropped);

        ApiDTO api = document.api(integrationId);
        List<ApiOperationDTO> operations = document.operations();

        List<String> conflicts = new ArrayList<>();
        Map<String, String> seen = new LinkedHashMap<>();
        for (ApiOperationDTO operation : operations) {
            String fullPath = ApiPaths.fullPath(api.basePath(), operation.path());
            String described = operation.method() + " " + fullPath;
            apiService.conflictsWith(operation.method(), fullPath, other -> false)
                .forEach(other -> conflicts.add(described + " clashes with " + other));
            String earlier = seen.putIfAbsent(ApiPaths.conflictKey(operation.method(), fullPath), described);
            if (earlier != null) {
                conflicts.add(described + " clashes with " + earlier + " in the same document");
            }
        }
        if (!conflicts.isEmpty()) {
            throw new ApiRuleException("Nothing was imported: " + conflicts.size() + " of its Operations clash with existing ones.", conflicts);
        }

        ApiDTO created = apiService.createApi(api);
        for (ApiOperationDTO operation : operations) {
            apiService.createOperation(created.id(), operation, false);
        }
        return new ApiImportResultDTO(apiService.findOne(created.id()).orElseThrow(), List.copyOf(dropped));
    }

    /** The API as an OpenAPI 3.0.3 document, YAML or (with format {@code json}) JSON. */
    @Transactional(readOnly = true)
    public String exportDocument(Long apiId, String format, String listenerUrl) {
        return exportDocument(apiId, format, listenerUrl, applicationProperties.getGateway().getTenant());
    }

    @Transactional(readOnly = true)
    public String exportDocument(Long apiId, String format, String listenerUrl, String tenant) {
        ApiDTO api = apiService.findOne(apiId).orElseThrow(() -> new ApiRuleException("There is no API " + apiId + "."));
        ObjectNode root = JSON.createObjectNode();
        root.put("openapi", "3.0.3");

        ObjectNode info = root.putObject("info");
        info.put("title", api.name());
        info.put("version", api.versionLabel() == null ? "1.0" : api.versionLabel());
        if (api.description() != null) {
            info.put("description", api.description());
        }

        String serverPath = ApiPaths.runtimePath(tenant, api.basePath());
        root.putArray("servers").addObject().put("url", stripTrailingSlash(listenerUrl) + ("/".equals(serverPath) ? "" : serverPath));

        ObjectNode paths = root.putObject("paths");
        for (ApiOperationDTO operation : api.operations()) {
            ObjectNode pathItem = paths.has(operation.path()) ? (ObjectNode) paths.get(operation.path()) : paths.putObject(operation.path());
            pathItem.set(operation.method().toLowerCase(Locale.ROOT), exportOperation(operation));
        }

        root.putObject("components").putObject("schemas").set("Problem", problemSchema());

        try {
            return "json".equalsIgnoreCase(format) ? JSON.writerWithDefaultPrettyPrinter().writeValueAsString(root) : YAML.writeValueAsString(root);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("The OpenAPI document could not be written", e);
        }
    }

    private ObjectNode exportOperation(ApiOperationDTO operation) {
        ObjectNode node = JSON.createObjectNode();
        putIfPresent(node, "operationId", operation.operationId());
        putIfPresent(node, "summary", operation.summary());
        putIfPresent(node, "description", operation.description());

        if (!operation.parameters().isEmpty()) {
            ArrayNode parameters = node.putArray("parameters");
            for (ApiParameterDTO parameter : operation.parameters()) {
                ObjectNode p = parameters.addObject();
                p.put("name", parameter.name());
                p.put("in", parameter.in());
                if (parameter.required()) {
                    p.put("required", true);
                }
                putIfPresent(p, "description", parameter.description());
                p.putObject("schema").put("type", parameter.type());
            }
        }

        if (operation.requestSchema() != null) {
            node.putObject("requestBody").putObject("content").putObject(operation.requestMediaType()).set("schema", schema(operation.requestSchema()));
        }

        ObjectNode responses = node.putObject("responses");
        for (ApiDeclaredResponseDTO declared : operation.declaredResponses()) {
            ObjectNode response = responses.putObject(declared.status());
            response.put("description", declared.description());
            if (declared.mediaType() != null || declared.schema() != null) {
                ObjectNode mediaType = response.putObject("content").putObject(declared.mediaType() != null ? declared.mediaType() : operation.responseMediaType());
                if (declared.schema() != null) {
                    mediaType.set("schema", schema(declared.schema()));
                }
            }
        }
        if (!responses.has("500")) {
            ObjectNode problem = responses.putObject("500");
            problem.put("description", "The request failed. The body names the Operation and gives a correlation id to look the failure up with.");
            problem.putObject("content").putObject(PROBLEM_MEDIA_TYPE).putObject("schema").put("$ref", "#/components/schemas/Problem");
        }
        return node;
    }

    private static ObjectNode problemSchema() {
        ObjectNode schema = JSON.createObjectNode();
        schema.put("type", "object");
        ObjectNode properties = schema.putObject("properties");
        properties.putObject("type").put("type", "string");
        properties.putObject("title").put("type", "string");
        properties.putObject("status").put("type", "integer");
        properties.putObject("detail").put("type", "string");
        properties.putObject("instance").put("type", "string").put("description", "The Operation, such as GET /customers/{id}.");
        properties.putObject("correlationId").put("type", "string").put("description", "The same id as the Flow's Alert for this failure.");
        return schema;
    }

    private static JsonNode schema(String text) {
        try {
            return JSON.readTree(text);
        } catch (JsonProcessingException e) {
            throw new ApiRuleException("A stored schema isn't valid JSON: " + e.getOriginalMessage());
        }
    }

    private static JsonNode read(String text) {
        JsonNode root;
        try {
            root = YAML.readTree(text == null ? "" : text);
        } catch (JsonProcessingException e) {
            throw new ApiRuleException("This isn't JSON or YAML: " + e.getOriginalMessage());
        }
        if (root == null || !root.isObject()) {
            throw new ApiRuleException("This isn't an OpenAPI 3.0 or 3.1 document.");
        }
        if (root.has("swagger")) {
            throw new ApiRuleException("This is a Swagger 2.0 document. Only OpenAPI 3.0 and 3.1 are supported: convert it to OpenAPI 3 first, "
                + "for example with the Swagger Editor or swagger2openapi.");
        }
        String version = root.path("openapi").asText("");
        if (!version.startsWith("3.0") && !version.startsWith("3.1")) {
            throw new ApiRuleException("This isn't an OpenAPI 3.0 or 3.1 document: it has no openapi: 3.0.x or 3.1.x.");
        }

        ParseOptions options = new ParseOptions();
        options.setResolve(false);
        SwaggerParseResult result = new OpenAPIV3Parser().readContents(text, null, options);
        if (result.getOpenAPI() == null) {
            throw new ApiRuleException("This OpenAPI document can't be read: " + String.join("; ", Objects.requireNonNullElse(result.getMessages(), List.of())));
        }
        return root;
    }

    private static void putIfPresent(ObjectNode node, String field, String value) {
        if (value != null && !value.isBlank()) {
            node.put(field, value);
        }
    }

    private static String stripTrailingSlash(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    /** One document being imported: what maps into the model, and a note for everything that doesn't. */
    private static final class Document {

        private final JsonNode root;
        private final List<String> dropped;
        private String basePath;
        private String stripFromPaths = "";

        Document(JsonNode root, List<String> dropped) {
            this.root = root;
            this.dropped = dropped;
        }

        ApiDTO api(Long integrationId) {
            JsonNode info = root.path("info");
            String title = info.path("title").asText("").strip();
            dropUnknown(root, Set.of("openapi", "info", "paths", "components", "servers"), "", "");
            dropUnknown(info, Set.of("title", "version", "description"), "", " of info");
            root.path("components").fieldNames().forEachRemaining(component -> {
                if (component.equals("securitySchemes")) {
                    root.path("components").path(component).fieldNames().forEachRemaining(name -> dropped.add("security scheme " + name));
                } else if (!RESOLVED_COMPONENTS.contains(component)) {
                    dropped.add(component + " of components");
                }
            });
            basePath = basePath();
            return new ApiDTO(null, title.isEmpty() ? "Imported API" : title, basePath, textOrNull(info.path("version")),
                textOrNull(info.path("description")), integrationId, 0, null);
        }

        /**
         * The first server's path, or else the first path segment all paths share (so the full paths stay the same),
         * or else /.
         */
        private String basePath() {
            JsonNode servers = root.path("servers");
            if (servers.isArray() && !servers.isEmpty()) {
                String url = servers.get(0).path("url").asText("");
                String path = url.replaceFirst("^[a-zA-Z][a-zA-Z0-9+.-]*://[^/]*", "");
                boolean usable = !path.contains("{") && !ApiPaths.normalize(path).equals("/");
                dropped.add(usable ? "servers (the base path " + ApiPaths.normalize(path) + " was taken from the first one)" : "servers");
                if (usable) {
                    return ApiPaths.normalize(path);
                }
            }
            List<String> paths = new ArrayList<>();
            root.path("paths").fieldNames().forEachRemaining(path -> {
                if (!path.startsWith("x-")) {
                    paths.add(path);
                }
            });
            String first = paths.isEmpty() ? "" : firstSegment(paths.getFirst());
            boolean shared = !first.isEmpty() && !first.contains("{") && paths.stream().allMatch(path -> first.equals(firstSegment(path)));
            if (shared) {
                stripFromPaths = "/" + first;
                return "/" + first;
            }
            return "/";
        }

        private static String firstSegment(String path) {
            String trimmed = ApiPaths.normalize(path).substring(1);
            int slash = trimmed.indexOf('/');
            return slash < 0 ? trimmed : trimmed.substring(0, slash);
        }

        List<ApiOperationDTO> operations() {
            List<ApiOperationDTO> operations = new ArrayList<>();
            Iterator<Map.Entry<String, JsonNode>> paths = root.path("paths").fields();
            while (paths.hasNext()) {
                Map.Entry<String, JsonNode> entry = paths.next();
                String path = entry.getKey();
                if (path.startsWith("x-")) {
                    dropped.add(path + " (extension) of paths");
                    continue;
                }
                JsonNode pathItem = resolved(entry.getValue());
                pathItem.fields().forEachRemaining(field -> {
                    String key = field.getKey();
                    if (ApiService.METHODS.contains(key.toUpperCase(Locale.ROOT))) {
                        operations.add(operation(key.toUpperCase(Locale.ROOT), path, pathItem, field.getValue()));
                    } else if (!key.equals("parameters")) {
                        dropped.add(describeKey(key) + " of the path " + path);
                    }
                });
            }
            return operations;
        }

        private ApiOperationDTO operation(String method, String documentPath, JsonNode pathItem, JsonNode operation) {
            String where = method + " " + documentPath;
            dropUnknown(operation, OPERATION_KEYS, "", " of " + where);

            String path = ApiPaths.normalize(documentPath.startsWith(stripFromPaths) ? documentPath.substring(stripFromPaths.length()) : documentPath);

            List<ApiParameterDTO> parameters = parameters(where, pathItem.path("parameters"), operation.path("parameters"));

            String requestMediaType = null;
            String requestSchema = null;
            if (operation.has("requestBody")) {
                JsonNode requestBody = resolved(operation.get("requestBody"));
                dropUnknown(requestBody, REQUEST_BODY_KEYS, "", " of the request body of " + where);
                Map.Entry<String, JsonNode> content = firstContent(requestBody, "the request body of " + where);
                if (content != null) {
                    requestMediaType = content.getKey();
                    requestSchema = schemaText(content.getValue());
                }
            }

            List<ApiDeclaredResponseDTO> responses = new ArrayList<>();
            String responseMediaType = null;
            Iterator<Map.Entry<String, JsonNode>> statuses = operation.path("responses").fields();
            while (statuses.hasNext()) {
                Map.Entry<String, JsonNode> entry = statuses.next();
                String status = entry.getKey().toLowerCase(Locale.ROOT);
                if (!ApiService.isStatus(status)) {
                    dropped.add("the " + entry.getKey() + " response of " + where);
                    continue;
                }
                String whereResponse = "the " + status + " response of " + where;
                JsonNode response = resolved(entry.getValue());
                dropUnknown(response, RESPONSE_KEYS, "", " of " + whereResponse);
                response.path("headers").fieldNames().forEachRemaining(header -> dropped.add("the header " + header + " of " + whereResponse));
                Map.Entry<String, JsonNode> content = firstContent(response, whereResponse);
                String description = response.path("description").asText("").isBlank() ? "Response " + status : response.path("description").asText();
                responses.add(new ApiDeclaredResponseDTO(status, description, content == null ? null : content.getKey(),
                    content == null ? null : schemaText(content.getValue())));
                if (responseMediaType == null && content != null && status.startsWith("2")) {
                    responseMediaType = content.getKey();
                }
            }

            return new ApiOperationDTO(null, null, method, path, null, textOrNull(operation.path("operationId")),
                textOrNull(operation.path("summary")), textOrNull(operation.path("description")), requestMediaType, responseMediaType,
                requestSchema, parameters, responses, null, null, "flow");
        }

        /** Path-level parameters, overridden by the Operation's own with the same name and place. */
        private List<ApiParameterDTO> parameters(String where, JsonNode pathLevel, JsonNode operationLevel) {
            Map<String, ApiParameterDTO> byKey = new LinkedHashMap<>();
            for (JsonNode list : List.of(pathLevel, operationLevel)) {
                for (JsonNode node : list) {
                    JsonNode parameter = resolved(node);
                    String name = parameter.path("name").asText("");
                    String in = parameter.path("in").asText("");
                    if (in.equals("cookie")) {
                        dropped.add("the cookie parameter " + name + " of " + where);
                        continue;
                    }
                    String whereParameter = " of the " + in + " parameter " + name + " of " + where;
                    if (parameter.has("example") || parameter.has("examples")) {
                        dropped.add("the example" + whereParameter);
                    }
                    dropUnknown(parameter, PARAMETER_KEYS, "", whereParameter);
                    String type = parameterType(parameter.path("schema").path("type"));
                    if (type == null) {
                        dropped.add("the schema" + whereParameter + " (kept as a string)");
                        type = "string";
                    }
                    byKey.put(in + ":" + name, new ApiParameterDTO(name, in, type, parameter.path("required").asBoolean(false),
                        textOrNull(parameter.path("description"))));
                }
            }
            return new ArrayList<>(byKey.values());
        }

        /** A parameter's type when the model has it; an array type of 3.1 counts by its one non-null type. */
        private static String parameterType(JsonNode type) {
            String name = type.isTextual() ? type.asText() : null;
            if (type.isArray()) {
                List<String> types = new ArrayList<>();
                type.forEach(t -> {
                    if (!t.asText().equals("null")) {
                        types.add(t.asText());
                    }
                });
                name = types.size() == 1 ? types.getFirst() : null;
            }
            return name != null && ApiService.PARAMETER_TYPES.contains(name) ? name : name == null && type.isMissingNode() ? "string" : null;
        }

        /** The first media type of a request body or response; any others, and examples, are dropped. */
        private Map.Entry<String, JsonNode> firstContent(JsonNode owner, String where) {
            Iterator<Map.Entry<String, JsonNode>> content = owner.path("content").fields();
            if (!content.hasNext()) {
                return null;
            }
            Map.Entry<String, JsonNode> first = content.next();
            dropUnknown(first.getValue(), MEDIA_TYPE_KEYS, "", " of " + first.getKey() + " in " + where);
            content.forEachRemaining(other -> dropped.add("the media type " + other.getKey() + " of " + where));
            return first;
        }

        private String schemaText(JsonNode mediaType) {
            JsonNode schema = mediaType.get("schema");
            if (schema == null || schema.isNull()) {
                return null;
            }
            try {
                return JSON.writeValueAsString(resolved(schema));
            } catch (JsonProcessingException e) {
                throw new IllegalStateException(e);
            }
        }

        private void dropUnknown(JsonNode node, Set<String> known, String prefix, String where) {
            node.fieldNames().forEachRemaining(key -> {
                if (!known.contains(key)) {
                    dropped.add(prefix + describeKey(key) + where);
                }
            });
        }

        private static String describeKey(String key) {
            return key.startsWith("x-") ? key + " (extension)" : key;
        }

        /** The node with every local $ref replaced by what it points to; a $ref back into itself stays a $ref. */
        private JsonNode resolved(JsonNode node) {
            return resolved(node, new ArrayDeque<>());
        }

        private JsonNode resolved(JsonNode node, Deque<String> trail) {
            if (node.isObject() && node.path("$ref").isTextual()) {
                String ref = node.get("$ref").asText();
                if (!ref.startsWith("#/") || trail.contains(ref)) {
                    return node;
                }
                JsonNode target = root.at(ref.substring(1));
                if (target.isMissingNode()) {
                    return node;
                }
                trail.push(ref);
                JsonNode result = resolved(target, trail);
                trail.pop();
                return result;
            }
            if (node.isObject()) {
                ObjectNode copy = JSON.createObjectNode();
                node.fields().forEachRemaining(field -> copy.set(field.getKey(), resolved(field.getValue(), trail)));
                return copy;
            }
            if (node.isArray()) {
                ArrayNode copy = JSON.createArrayNode();
                node.forEach(element -> copy.add(resolved(element, trail)));
                return copy;
            }
            return node;
        }

        private static String textOrNull(JsonNode node) {
            return node.isValueNode() && !node.asText().isBlank() ? node.asText() : null;
        }
    }
}
