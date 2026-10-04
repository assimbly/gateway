package org.assimbly.gateway.domain;

import jakarta.persistence.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * One HTTP method on one path template within an API, such as {@code GET /customers/{id}}, with its contract.
 * Its Handler Flow's Source is the Operation (ADR 0003).
 */
@Entity
@Table(name = "api_operation")
public class ApiOperation implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator", sequenceName = "sequence_generator")
    @Column(name = "id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "api_id")
    private Api api;

    @Column(name = "method", nullable = false)
    private String method;

    @Column(name = "path", nullable = false)
    private String path;

    @Column(name = "operation_id")
    private String operationId;

    @Column(name = "summary")
    private String summary;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "request_media_type")
    private String requestMediaType;

    @Column(name = "response_media_type")
    private String responseMediaType;

    @Lob
    @Column(name = "request_schema")
    private String requestSchema;

    @OneToOne(optional = false)
    @JoinColumn(name = "handler_flow_id", unique = true)
    private Flow handlerFlow;

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<ApiParameter> parameters = new ArrayList<>();

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<ApiDeclaredResponse> declaredResponses = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Api getApi() {
        return api;
    }

    public void setApi(Api api) {
        this.api = api;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getOperationId() {
        return operationId;
    }

    public void setOperationId(String operationId) {
        this.operationId = operationId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequestMediaType() {
        return requestMediaType;
    }

    public void setRequestMediaType(String requestMediaType) {
        this.requestMediaType = requestMediaType;
    }

    public String getResponseMediaType() {
        return responseMediaType;
    }

    public void setResponseMediaType(String responseMediaType) {
        this.responseMediaType = responseMediaType;
    }

    public String getRequestSchema() {
        return requestSchema;
    }

    public void setRequestSchema(String requestSchema) {
        this.requestSchema = requestSchema;
    }

    public Flow getHandlerFlow() {
        return handlerFlow;
    }

    public void setHandlerFlow(Flow handlerFlow) {
        this.handlerFlow = handlerFlow;
    }

    public List<ApiParameter> getParameters() {
        return parameters;
    }

    /** Replaces the parameters; the rows not given again are deleted. */
    public void setParameters(List<ApiParameter> parameters) {
        this.parameters.clear();
        parameters.forEach(parameter -> {
            parameter.setOperation(this);
            this.parameters.add(parameter);
        });
    }

    public List<ApiDeclaredResponse> getDeclaredResponses() {
        return declaredResponses;
    }

    /** Replaces the Declared responses; the rows not given again are deleted. */
    public void setDeclaredResponses(List<ApiDeclaredResponse> declaredResponses) {
        this.declaredResponses.clear();
        declaredResponses.forEach(response -> {
            response.setOperation(this);
            this.declaredResponses.add(response);
        });
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ApiOperation operation) || operation.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), operation.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ApiOperation{id=" + id + ", method='" + method + "', path='" + path + "'}";
    }
}
