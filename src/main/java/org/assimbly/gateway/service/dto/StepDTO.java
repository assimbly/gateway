package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;
import java.util.Set;

import org.assimbly.gateway.domain.Link;
import org.assimbly.gateway.domain.enumeration.StepType;

/**
 * A DTO for the Step entity.
 */
public class StepDTO implements Serializable {

    private Long id;

    private String name;

    private StepType stepType;

    private String componentType;

    private String uri;

    private String options;

    private Long flowId;

    private Integer routeId;

    private Integer responseId;

    private Long connectionId;

    private Long messageId;

    private Set<Link> links;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public StepType getStepType() {
        return stepType;
    }

    public void setStepType(StepType stepType) {
        this.stepType = stepType;
    }

    public String getComponentType() {
        return componentType;
    }

    public void setComponentType(String componentType) {
        this.componentType = componentType;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getOptions() {
        return options;
    }

    public void setOptions(String options) {
        this.options = options;
    }

    public Long getFlowId() {
        return flowId;
    }

    public void setFlowId(Long flowId) {
        this.flowId = flowId;
    }

    public Integer getRouteId() {
        return routeId;
    }

    public void setRouteId(Integer routeId) {
        this.routeId = routeId;
    }

    public Integer getResponseId() {
        return responseId;
    }

    public void setResponseId(Integer responseId) {
        this.responseId = responseId;
    }

    public Long getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(Long connectionId) {
        this.connectionId = connectionId;
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Set<Link> getLinks() {
        return links;
    }

    public void setLinks(Set<Link> links) {
        this.links = links;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        StepDTO stepDTO = (StepDTO) o;
        if (stepDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), stepDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "StepDTO{" +
            "id=" + getId() +
            ", stepType='" + getStepType() + "'" +
            ", componentType='" + getComponentType() + "'" +
            ", uri='" + getUri() + "'" +
            ", options='" + getOptions() + "'" +
            ", responseId=" + getResponseId() +
            ", flow=" + getFlowId() +
            ", connection=" + getConnectionId() +
            ", message=" + getMessageId() +
            ", links=" + getLinks() +
            "}";
    }
}
