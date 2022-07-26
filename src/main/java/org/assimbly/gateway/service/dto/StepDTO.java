package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;
import org.assimbly.gateway.domain.enumeration.StepType;

/**
 * A DTO for the Step entity.
 */
public class StepDTO implements Serializable {

    private Long id;

    private StepType stepType;

    private String componentType;

    private String uri;

    private String options;

    private Integer routeId;

    private Integer responseId;

    private Long flowId;

    private Long serviceId;

    private Long headerId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getFlowId() {
        return flowId;
    }

    public void setFlowId(Long flowId) {
        this.flowId = flowId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getHeaderId() {
        return headerId;
    }

    public void setHeaderId(Long headerId) {
        this.headerId = headerId;
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
            ", service=" + getServiceId() +
            ", header=" + getHeaderId() +
            "}";
    }
}
