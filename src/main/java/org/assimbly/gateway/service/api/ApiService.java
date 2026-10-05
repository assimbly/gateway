package org.assimbly.gateway.service.api;

import org.assimbly.gateway.domain.Api;
import org.assimbly.gateway.domain.ApiDeclaredResponse;
import org.assimbly.gateway.domain.ApiOperation;
import org.assimbly.gateway.domain.ApiParameter;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.repository.ApiOperationRepository;
import org.assimbly.gateway.repository.ApiRepository;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.dto.ApiDTO;
import org.assimbly.gateway.service.dto.ApiDeclaredResponseDTO;
import org.assimbly.gateway.service.dto.ApiHandlerDTO;
import org.assimbly.gateway.service.dto.ApiOperationDTO;
import org.assimbly.gateway.service.dto.ApiParameterDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;

/**
 * APIs and their Operations (docs/specs/rest-api-builder.md). An Operation is created and deleted together with its
 * Handler Flow, and saving it rewrites that Flow's Source.
 */
@Service
@Transactional
public class ApiService {

    public static final List<String> METHODS = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS");
    public static final List<String> PARAMETER_LOCATIONS = List.of("path", "query", "header");
    public static final List<String> PARAMETER_TYPES = List.of("string", "integer", "number", "boolean");
    public static final String DEFAULT_MEDIA_TYPE = "application/json";

    private final ApiRepository apiRepository;
    private final ApiOperationRepository operationRepository;
    private final FlowRepository flowRepository;
    private final IntegrationRepository integrationRepository;
    private final HandlerFlows handlerFlows;

    public ApiService(ApiRepository apiRepository, ApiOperationRepository operationRepository, FlowRepository flowRepository,
                      IntegrationRepository integrationRepository, HandlerFlows handlerFlows) {
        this.apiRepository = apiRepository;
        this.operationRepository = operationRepository;
        this.flowRepository = flowRepository;
        this.integrationRepository = integrationRepository;
        this.handlerFlows = handlerFlows;
    }

    @Transactional(readOnly = true)
    public List<ApiDTO> findAll() {
        return apiRepository.findAllByOrderByNameAsc().stream().map(api -> toDto(api, true)).toList();
    }

    @Transactional(readOnly = true)
    public Optional<ApiDTO> findOne(Long id) {
        return apiRepository.findById(id).map(api -> toDto(api, true));
    }

    @Transactional(readOnly = true)
    public Optional<ApiOperationDTO> findOperation(Long apiId, Long operationId) {
        return operationRepository.findById(operationId).filter(o -> o.getApi().getId().equals(apiId)).map(this::toDto);
    }

    public ApiDTO createApi(ApiDTO dto) {
        Api api = new Api();
        api.setIntegration(integration(dto.integrationId()));
        writeApi(api, dto);
        return toDto(apiRepository.save(api), true);
    }

    /** Saves the API's own fields. A new base path moves every Operation, so their Handler Flows' Sources move too. */
    public ApiDTO updateApi(Long id, ApiDTO dto) {
        Api api = api(id);
        String oldBasePath = api.getBasePath();
        String newBasePath = ApiPaths.normalize(required(dto.basePath(), "Give the API a base path."));
        boolean moved = !ApiPaths.normalize(oldBasePath).equals(newBasePath);
        if (moved) {
            for (ApiOperation operation : api.getOperations()) {
                String fullPath = ApiPaths.fullPath(newBasePath, operation.getPath());
                List<String> conflicts = conflictsWith(operation.getMethod(), fullPath, other -> other.getApi() == api);
                if (!conflicts.isEmpty()) {
                    throw new ApiRuleException("With the base path " + newBasePath + ", " + operation.getMethod() + " " + fullPath
                        + " would clash with " + conflicts.getFirst() + ".");
                }
            }
        }
        writeApi(api, dto);
        if (moved) {
            api.getOperations().forEach(handlerFlows::syncSource);
        }
        return toDto(apiRepository.save(api), true);
    }

    public void deleteApi(Long id) {
        Api api = api(id);
        List<Flow> handlerFlowsToDelete = api.getOperations().stream().map(ApiOperation::getHandlerFlow).toList();
        apiRepository.delete(api);
        apiRepository.flush();
        flowRepository.deleteAll(handlerFlowsToDelete);
    }

    public ApiOperationDTO createOperation(Long apiId, ApiOperationDTO dto) {
        return createOperation(apiId, dto, true);
    }

    /**
     * Creates the Operation and its Handler Flow. With {@code withResponse} false, the Handler Flow is only the
     * Operation, as an import makes it: a Draft until a Response is added.
     */
    public ApiOperationDTO createOperation(Long apiId, ApiOperationDTO dto, boolean withResponse) {
        Api api = api(apiId);
        // Joined to its API only once it is valid and has its Handler Flow, so no query flushes it half-made.
        ApiOperation operation = new ApiOperation();
        operation.setApi(api);
        writeOperation(operation, dto);
        operation.setHandlerFlow(handlerFlows.create(operation, api.getIntegration(), withResponse));
        api.addOperation(operation);
        return toDto(operationRepository.save(operation));
    }

    public ApiOperationDTO updateOperation(Long apiId, Long operationId, ApiOperationDTO dto) {
        ApiOperation operation = operation(apiId, operationId);
        writeOperation(operation, dto);
        handlerFlows.syncSource(operation);
        return toDto(operationRepository.save(operation));
    }

    /** Deletes the Operation and its Handler Flow, which lives and dies with it. */
    public void deleteOperation(Long apiId, Long operationId) {
        ApiOperation operation = operation(apiId, operationId);
        Flow flow = operation.getHandlerFlow();
        operation.getApi().removeOperation(operation);
        operationRepository.delete(operation);
        operationRepository.flush();
        flowRepository.delete(flow);
    }

    /** A Flow imported from a backup, to become the Handler Flow of the Operation it was exported with. */
    public record RestoredOperation(ApiOperationDTO operation, Flow handlerFlow) {
    }

    /**
     * Restores an API from a backup. An API with the same name is updated, and each Operation (matched by method and
     * path) gets the Flow imported for it as its Handler Flow, with the Source rewritten for this Gateway.
     */
    public ApiDTO restoreApi(ApiDTO dto, List<RestoredOperation> restored) {
        Api api = apiRepository.findByName(dto.name()).orElseGet(() -> {
            Api created = new Api();
            created.setIntegration(integration(dto.integrationId()));
            return created;
        });
        writeApi(api, dto);
        api = apiRepository.save(api);

        for (RestoredOperation restoredOperation : restored) {
            ApiOperationDTO given = restoredOperation.operation();
            String path = ApiPaths.normalize(given.path());
            Optional<ApiOperation> existing = api.getOperations().stream()
                .filter(o -> o.getMethod().equalsIgnoreCase(given.method()) && o.getPath().equals(path))
                .findFirst();
            ApiOperation operation = existing.orElseGet(ApiOperation::new);
            operation.setApi(api);
            writeOperation(operation, given);
            operation.setHandlerFlow(restoredOperation.handlerFlow());
            if (existing.isEmpty()) {
                api.addOperation(operation);
            }
            operation = operationRepository.save(operation);
            handlerFlows.syncSource(operation);
            handlerFlows.dropDerivedContentType(operation);
        }
        return toDto(api, true);
    }

    /** What the Flow needs to know as a Handler Flow; empty for any other Flow. */
    @Transactional(readOnly = true)
    public Optional<ApiHandlerDTO> handlerOf(Long flowId) {
        return operationRepository.findByHandlerFlowId(flowId).map(this::toHandlerDto);
    }

    /** Every Handler Flow by its Flow id, for the Flows list. */
    @Transactional(readOnly = true)
    public Map<Long, ApiHandlerDTO> handlers() {
        Map<Long, ApiHandlerDTO> handlers = new LinkedHashMap<>();
        operationRepository.findAll().forEach(operation -> handlers.put(operation.getHandlerFlow().getId(), toHandlerDto(operation)));
        return handlers;
    }

    /** A Handler Flow is deleted with its Operation, never on its own. */
    @Transactional(readOnly = true)
    public void checkFlowDeletable(Long flowId) {
        operationRepository.findByHandlerFlowId(flowId).ifPresent(operation -> {
            throw new ApiRuleException("This Flow handles " + describe(operation)
                + ". Delete the Operation instead; its Handler Flow goes with it.");
        });
    }

    /**
     * The Operations of all APIs that already claim this method and full path, ignoring the Operation itself.
     * Path parameters count as the same whatever their name.
     */
    @Transactional(readOnly = true)
    public List<String> conflictsWith(String method, String fullPath, Predicate<ApiOperation> ignored) {
        String key = ApiPaths.conflictKey(method, fullPath);
        return operationRepository.findAll().stream()
            .filter(other -> !ignored.test(other))
            .filter(other -> ApiPaths.conflictKey(other.getMethod(), fullPath(other)).equals(key))
            .map(ApiService::describe)
            .toList();
    }

    Integration integration(Long integrationId) {
        if (integrationId != null) {
            return integrationRepository.findById(integrationId).orElseThrow(() -> new ApiRuleException("There is no Integration " + integrationId + "."));
        }
        return integrationRepository.findAll().stream().findFirst().orElseThrow(() -> new ApiRuleException("Create an Integration first."));
    }

    private void writeApi(Api api, ApiDTO dto) {
        String name = required(dto.name(), "Give the API a name.");
        String basePath = ApiPaths.normalize(required(dto.basePath(), "Give the API a base path."));
        ApiPaths.checkBasePath(dto.basePath().strip());

        apiRepository.findByName(name).filter(other -> !Objects.equals(other.getId(), api.getId())).ifPresent(other -> {
            throw new ApiRuleException("There is already an API named " + name + ".");
        });
        apiRepository.findAll().stream()
            .filter(other -> !Objects.equals(other.getId(), api.getId()))
            .filter(other -> ApiPaths.normalize(other.getBasePath()).equals(basePath))
            .findFirst()
            .ifPresent(other -> {
                throw new ApiRuleException("The base path " + basePath + " already belongs to the API " + other.getName() + ".");
            });

        api.setName(name);
        api.setBasePath(basePath);
        api.setVersionLabel(blankToNull(dto.versionLabel()));
        api.setDescription(blankToNull(dto.description()));
    }

    private void writeOperation(ApiOperation operation, ApiOperationDTO dto) {
        String method = required(dto.method(), "Choose the Operation's method.").toUpperCase(Locale.ROOT);
        if (!METHODS.contains(method)) {
            throw new ApiRuleException("The method " + method + " isn't one of " + String.join(", ", METHODS) + ".");
        }
        String path = required(dto.path(), "Give the Operation a path, such as /{id}.");
        ApiPaths.checkPath(path);
        path = ApiPaths.normalize(path);

        checkConflicts(operation, method, path);

        String operationId = blankToNull(dto.operationId());
        if (operationId != null) {
            operation.getApi().getOperations().stream()
                .filter(other -> other != operation && operationId.equals(other.getOperationId()))
                .findFirst()
                .ifPresent(other -> {
                    throw new ApiRuleException("The operationId " + operationId + " is already used by " + other.getMethod() + " " + other.getPath() + " in this API.");
                });
        }

        operation.setMethod(method);
        operation.setPath(path);
        operation.setOperationId(operationId);
        operation.setSummary(blankToNull(dto.summary()));
        operation.setDescription(blankToNull(dto.description()));
        operation.setRequestMediaType(Optional.ofNullable(blankToNull(dto.requestMediaType())).orElse(DEFAULT_MEDIA_TYPE));
        operation.setResponseMediaType(Optional.ofNullable(blankToNull(dto.responseMediaType())).orElse(DEFAULT_MEDIA_TYPE));
        operation.setRequestSchema(blankToNull(dto.requestSchema()));
        operation.setParameters(parameters(path, Optional.ofNullable(dto.parameters()).orElse(List.of())));
        operation.setDeclaredResponses(declaredResponses(Optional.ofNullable(dto.declaredResponses()).orElse(List.of())));
    }

    private void checkConflicts(ApiOperation operation, String method, String path) {
        String fullPath = ApiPaths.fullPath(operation.getApi().getBasePath(), path);
        List<String> conflicts = conflictsWith(method, fullPath, other -> other == operation || (operation.getId() != null && operation.getId().equals(other.getId())));
        if (!conflicts.isEmpty()) {
            throw new ApiRuleException(method + " " + fullPath + " is already handled by " + conflicts.getFirst() + ".", conflicts.size() > 1 ? conflicts : List.of());
        }
    }

    /**
     * Path parameters come from the path template: always required, in template order, keeping the type and
     * description given for them. Query and header parameters are taken as given.
     */
    static List<ApiParameter> parameters(String path, List<ApiParameterDTO> given) {
        List<ApiParameter> parameters = new ArrayList<>();
        for (String name : ApiPaths.pathParameterNames(path)) {
            Optional<ApiParameterDTO> described = given.stream().filter(p -> "path".equals(p.in()) && name.equals(p.name())).findFirst();
            parameters.add(new ApiParameter(name, "path", described.map(ApiParameterDTO::type).map(ApiService::parameterType).orElse("string"), true,
                described.map(ApiParameterDTO::description).map(ApiService::blankToNull).orElse(null)));
        }
        Set<String> seen = new HashSet<>();
        for (ApiParameterDTO parameter : given) {
            if ("path".equals(parameter.in())) {
                continue;
            }
            String name = required(parameter.name(), "Give each parameter a name.");
            if (!PARAMETER_LOCATIONS.contains(parameter.in())) {
                throw new ApiRuleException("The parameter " + name + " needs to be in the path, the query or a header.");
            }
            if (!seen.add(parameter.in() + ":" + name)) {
                throw new ApiRuleException("The " + parameter.in() + " parameter " + name + " is listed more than once.");
            }
            parameters.add(new ApiParameter(name, parameter.in(), parameterType(parameter.type()), parameter.required(), blankToNull(parameter.description())));
        }
        return parameters;
    }

    static List<ApiDeclaredResponse> declaredResponses(List<ApiDeclaredResponseDTO> given) {
        List<ApiDeclaredResponse> responses = new ArrayList<>();
        Set<String> statuses = new HashSet<>();
        for (ApiDeclaredResponseDTO response : given) {
            String status = required(response.status(), "Give each Declared response a status.").toLowerCase(Locale.ROOT);
            if (!isStatus(status)) {
                throw new ApiRuleException("The status " + status + " isn't a number from 100 to 599, or default.");
            }
            if (!statuses.add(status)) {
                throw new ApiRuleException("The status " + status + " is declared more than once.");
            }
            String description = required(response.description(), "Give the " + status + " response a description; OpenAPI requires one.");
            responses.add(new ApiDeclaredResponse(status, description, blankToNull(response.mediaType()), blankToNull(response.schema())));
        }
        return responses;
    }

    static boolean isStatus(String status) {
        if ("default".equals(status)) {
            return true;
        }
        try {
            int code = Integer.parseInt(status);
            return code >= 100 && code <= 599;
        } catch (NumberFormatException _) {
            return false;
        }
    }

    private static String parameterType(String type) {
        return type != null && PARAMETER_TYPES.contains(type) ? type : "string";
    }

    private Api api(Long id) {
        return apiRepository.findById(id).orElseThrow(() -> new ApiRuleException("There is no API " + id + "."));
    }

    private ApiOperation operation(Long apiId, Long operationId) {
        return operationRepository.findById(operationId)
            .filter(operation -> operation.getApi().getId().equals(apiId))
            .orElseThrow(() -> new ApiRuleException("The API " + apiId + " has no Operation " + operationId + "."));
    }

    static String fullPath(ApiOperation operation) {
        return ApiPaths.fullPath(operation.getApi().getBasePath(), operation.getPath());
    }

    /** Such as {@code GET /customers/{id} of the API Customers}. */
    static String describe(ApiOperation operation) {
        return operation.getMethod() + " " + fullPath(operation) + " of the API " + operation.getApi().getName();
    }

    ApiDTO toDto(Api api, boolean withOperations) {
        return new ApiDTO(api.getId(), api.getName(), api.getBasePath(), api.getVersionLabel(), api.getDescription(),
            api.getIntegration() == null ? null : api.getIntegration().getId(), api.getOperations().size(),
            withOperations ? api.getOperations().stream().map(this::toDto).toList() : null);
    }

    ApiOperationDTO toDto(ApiOperation operation) {
        Flow flow = operation.getHandlerFlow();
        return new ApiOperationDTO(operation.getId(), operation.getApi().getId(), operation.getMethod(), operation.getPath(), fullPath(operation),
            operation.getOperationId(), operation.getSummary(), operation.getDescription(), operation.getRequestMediaType(),
            operation.getResponseMediaType(), operation.getRequestSchema(),
            operation.getParameters().stream().map(p -> new ApiParameterDTO(p.getName(), p.getLocation(), p.getType(), p.isRequired(), p.getDescription())).toList(),
            operation.getDeclaredResponses().stream().map(r -> new ApiDeclaredResponseDTO(r.getStatus(), r.getDescription(), r.getMediaType(), r.getSchema())).toList(),
            flow == null ? null : flow.getId(), flow == null ? null : flow.getName(), flow == null ? null : flow.getType());
    }

    private ApiHandlerDTO toHandlerDto(ApiOperation operation) {
        return new ApiHandlerDTO(operation.getApi().getId(), operation.getApi().getName(), operation.getId(), operation.getMethod(),
            fullPath(operation), handlerFlows.runtimePath(operation),
            operation.getDeclaredResponses().stream().map(ApiDeclaredResponse::getStatus).toList(), operation.getResponseMediaType());
    }

    private static String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ApiRuleException(message);
        }
        return value.strip();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
