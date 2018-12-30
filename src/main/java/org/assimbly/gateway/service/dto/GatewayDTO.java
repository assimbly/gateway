package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.ConnectorType;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;

/**
 * A DTO for the Gateway entity.
 */
public class GatewayDTO implements Serializable {

    private Long id;

    private String name;

    private GatewayType type;

    private String environmentName;

    private EnvironmentType stage;

    private String defaultFromEndpointType;

    private String defaultToEndpointType;

    private String defaultErrorEndpointType;

    private Long wiretapEndpointId;

	private ConnectorType connectorType;

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

    public GatewayType getType() {
        return type;
    }

    public void setType(GatewayType type) {
        this.type = type;
    }

    public String getEnvironmentName() {
        return environmentName;
    }

    public void setEnvironmentName(String environmentName) {
        this.environmentName = environmentName;
    }

    public EnvironmentType getStage() {
        return stage;
    }

    public void setStage(EnvironmentType stage) {
        this.stage = stage;
    }

    public ConnectorType getConnectorType() {
        return connectorType;
    }

    public void setConnectorType(ConnectorType connectorType) {
        this.connectorType = connectorType;
    }

    public String getDefaultFromEndpointType() {
        return defaultFromEndpointType;
    }

    public void setDefaultFromEndpointType(String defaultFromEndpointType) {
        this.defaultFromEndpointType = defaultFromEndpointType;
    }

    public String getDefaultToEndpointType() {
        return defaultToEndpointType;
    }

    public void setDefaultToEndpointType(String defaultToEndpointType) {
        this.defaultToEndpointType = defaultToEndpointType;
    }

    public String getDefaultErrorEndpointType() {
        return defaultErrorEndpointType;
    }

    public void setDefaultErrorEndpointType(String defaultErrorEndpointType) {
        this.defaultErrorEndpointType = defaultErrorEndpointType;
    }

    public Long getWiretapEndpointId() {
        return wiretapEndpointId;
    }

    public void setWiretapEndpointId(Long wireTapEndpointId) {
        this.wiretapEndpointId = wireTapEndpointId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        GatewayDTO gatewayDTO = (GatewayDTO) o;
        if (gatewayDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), gatewayDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "GatewayDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", type='" + getType() + "'" +
            ", environmentName='" + getEnvironmentName() + "'" +
            ", stage='" + getStage() + "'" +
            ", connectorType='" + getConnectorType() + "'" +
            ", defaultFromEndpointType='" + getDefaultFromEndpointType() + "'" +
            ", defaultToEndpointType='" + getDefaultToEndpointType() + "'" +
            ", defaultErrorEndpointType='" + getDefaultErrorEndpointType() + "'" +
            ", wiretapEndpoint=" + getWiretapEndpointId() +
            "}";
    }
}
