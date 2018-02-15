package org.assimbly.gateway.service.dto;


import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A DTO for the CamelRoute entity.
 */
public class CamelRouteDTO implements Serializable {

    private Long id;

    private String name;

    private Long gatewayId;

    private Long fromEndpointId;

    private Long errorEndpointId;

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

    public Long getGatewayId() {
        return gatewayId;
    }

    public void setGatewayId(Long gatewayId) {
        this.gatewayId = gatewayId;
    }

    public Long getFromEndpointId() {
        return fromEndpointId;
    }

    public void setFromEndpointId(Long fromEndpointId) {
        this.fromEndpointId = fromEndpointId;
    }

    public Long getErrorEndpointId() {
        return errorEndpointId;
    }

    public void setErrorEndpointId(Long errorEndpointId) {
        this.errorEndpointId = errorEndpointId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        CamelRouteDTO camelRouteDTO = (CamelRouteDTO) o;
        if(camelRouteDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), camelRouteDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "CamelRouteDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
