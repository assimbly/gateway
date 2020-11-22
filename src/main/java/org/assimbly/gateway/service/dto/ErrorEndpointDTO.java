package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;
import org.assimbly.gateway.domain.enumeration.ComponentType;

/**
 * A DTO for the ErrorEndpoint entity.
 */
public class ErrorEndpointDTO implements Serializable {

    private Long id;

    private ComponentType type;

    private String uri;

    private String options;

    private Long serviceId;

    private Long headerId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ComponentType getType() {
        return type;
    }

    public void setType(ComponentType type) {
        this.type = type;
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

        ErrorEndpointDTO errorEndpointDTO = (ErrorEndpointDTO) o;
        if (errorEndpointDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), errorEndpointDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ErrorEndpointDTO{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", uri='" + getUri() + "'" +
            ", options='" + getOptions() + "'" +
            ", service=" + getServiceId() +
            ", header=" + getHeaderId() +
            "}";
    }
}
