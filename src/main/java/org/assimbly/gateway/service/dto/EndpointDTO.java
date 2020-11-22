package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;
import org.assimbly.gateway.domain.enumeration.ComponentType;

/**
 * A DTO for the Endpoint entity.
 */
public class EndpointDTO implements Serializable {

    private Long id;

    private ComponentType componentType;

    private String uri;

    private String options;

    private Long flowId;

    private Long serviceId;

    private Long headerId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ComponentType getComponentType() {
        return componentType;
    }

    public void setComponentType(ComponentType componentType) {
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

        EndpointDTO endpointDTO = (EndpointDTO) o;
        if (endpointDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), endpointDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "EndpointDTO{" +
            "id=" + getId() +
            ", componentType='" + getComponentType() + "'" +
            ", uri='" + getUri() + "'" +
            ", options='" + getOptions() + "'" +
            ", flow=" + getFlowId() +
            ", service=" + getServiceId() +
            ", header=" + getHeaderId() +
            "}";
    }
}
