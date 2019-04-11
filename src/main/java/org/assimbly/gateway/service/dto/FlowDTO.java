package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;
import java.util.Set;

import org.assimbly.gateway.domain.ToEndpoint;

/**
 * A DTO for the Flow entity.
 */
public class FlowDTO implements Serializable {

    private Long id;

    private String name;

    private Boolean autoStart;

    private Boolean offLoading;

    private int maximumRedeliveries;

    private int redeliveryDelay;
    
    private Long gatewayId;

    private Long fromEndpointId;

    private Long errorEndpointId;

    private Long maintenanceId;

    private Set<ToEndpoint> toEndpoints;
    
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

    public Boolean isAutoStart() {
        return autoStart;
    }

    public void setAutoStart(Boolean autoStart) {
        this.autoStart = autoStart;
    }

    public Boolean isOffLoading() {
        return offLoading;
    }

    public void setOffLoading(Boolean offLoading) {
        this.offLoading = offLoading;
    }
    
    public int maximumRedeliveries() {
        return maximumRedeliveries;
    }

    public void setMaximumRedeliveries(int maximumRedeliveries) {
        this.maximumRedeliveries = maximumRedeliveries;
    }
    
    public int redeliveryDelay() {
        return redeliveryDelay;
    }

    public void setRedeliveryDelay(int redeliveryDelay) {
        this.redeliveryDelay = redeliveryDelay;
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

    public Long getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Long maintenanceId) {
        this.maintenanceId = maintenanceId;
    }
    
    public Set<ToEndpoint> getToEndpoints() {
        return toEndpoints;
    }

    public void setToEndpoints(Set<ToEndpoint> toEndpoints) {
        this.toEndpoints = toEndpoints;
    }   
    
    
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        FlowDTO flowDTO = (FlowDTO) o;
        if (flowDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), flowDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "FlowDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", autoStart='" + isAutoStart() + "'" +
            ", offLoading='" + isOffLoading() + "'" +
            ", gateway=" + getGatewayId() +
            ", fromEndpoint=" + getFromEndpointId() +
            ", errorEndpoint=" + getErrorEndpointId() +
            "}";
    }
}
