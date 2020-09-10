package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;

import java.time.Instant;
import java.util.Set;

import org.assimbly.gateway.domain.ToEndpoint;
import org.assimbly.gateway.domain.enumeration.LogLevelType;

/**
 * A DTO for the Flow entity.
 */
public class FlowDTO implements Serializable {

    private Long id;

    private String name;

    private Boolean autoStart;

    private Boolean offLoading;

    private Integer maximumRedeliveries;

    private Integer redeliveryDelay;

    private String type;

    private Boolean loadBalancing;

    private LogLevelType logLevel;

    private Integer instances;

    private Integer version;

    private Instant created;

    private Instant lastModified;

    private Long gatewayId;

    private Long fromEndpointId;

    private Long errorEndpointId;
    
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

    public Integer getMaximumRedeliveries() {
        return maximumRedeliveries;
    }

    public void setMaximumRedeliveries(Integer maximumRedeliveries) {
        this.maximumRedeliveries = maximumRedeliveries;
    }

    public Integer getRedeliveryDelay() {
        return redeliveryDelay;
    }

    public void setRedeliveryDelay(Integer redeliveryDelay) {
        this.redeliveryDelay = redeliveryDelay;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean isLoadBalancing() {
        return loadBalancing;
    }

    public void setLoadBalancing(Boolean loadBalancing) {
        this.loadBalancing = loadBalancing;
    }

    public LogLevelType getLogLevel() {
        return logLevel;
    }

    public void setLogLevel(LogLevelType logLevel) {
        this.logLevel = logLevel;
    }

    
    public Integer getInstances() {
        return instances;
    }

    public void setInstances(Integer instances) {
        this.instances = instances;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }
    
    public Instant getCreated() {
        return created;
    }

    public void setCreated(Instant created) {
        this.created = created;
    }
    
    public Instant getLastModified() {
        return lastModified;
    }

    public void setLastModified(Instant lastModified) {
        this.lastModified = lastModified;
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
            ", maximumRedeliveries=" + getMaximumRedeliveries() +
            ", redeliveryDelay=" + getRedeliveryDelay() +
            ", type='" + getType() + "'" +
            ", loadBalancing='" + isLoadBalancing() + "'" +
            ", logLevel='" + getLogLevel() + "'" +
            ", instances=" + getInstances() +
            ", gateway=" + getGatewayId() +
            ", fromEndpoint=" + getFromEndpointId() +
            ", errorEndpoint=" + getErrorEndpointId() +
            "}";
    }
}
