package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import org.assimbly.gateway.domain.enumeration.GatewayType;

import org.assimbly.gateway.domain.enumeration.EnvironmentType;

/**
 * A Gateway.
 */
@Entity
@Table(name = "gateway")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Gateway implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "jhi_type")
    private GatewayType type;

    @Column(name = "environment_name")
    private String environmentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage")
    private EnvironmentType stage;

    @Column(name = "default_from_endpoint_type")
    private String defaultFromEndpointType;

    @Column(name = "default_to_endpoint_type")
    private String defaultToEndpointType;

    @Column(name = "default_error_endpoint_type")
    private String defaultErrorEndpointType;

    @OneToMany(mappedBy = "gateway")
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<FlowRoute> flowRoutes = new HashSet<>();
    @OneToMany(mappedBy = "gateway")
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<EnvironmentVariables> environmentVariables = new HashSet<>();
    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public Gateway name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GatewayType getType() {
        return type;
    }

    public Gateway type(GatewayType type) {
        this.type = type;
        return this;
    }

    public void setType(GatewayType type) {
        this.type = type;
    }

    public String getEnvironmentName() {
        return environmentName;
    }

    public Gateway environmentName(String environmentName) {
        this.environmentName = environmentName;
        return this;
    }

    public void setEnvironmentName(String environmentName) {
        this.environmentName = environmentName;
    }

    public EnvironmentType getStage() {
        return stage;
    }

    public Gateway stage(EnvironmentType stage) {
        this.stage = stage;
        return this;
    }

    public void setStage(EnvironmentType stage) {
        this.stage = stage;
    }

    public String getDefaultFromEndpointType() {
        return defaultFromEndpointType;
    }

    public Gateway defaultFromEndpointType(String defaultFromEndpointType) {
        this.defaultFromEndpointType = defaultFromEndpointType;
        return this;
    }

    public void setDefaultFromEndpointType(String defaultFromEndpointType) {
        this.defaultFromEndpointType = defaultFromEndpointType;
    }

    public String getDefaultToEndpointType() {
        return defaultToEndpointType;
    }

    public Gateway defaultToEndpointType(String defaultToEndpointType) {
        this.defaultToEndpointType = defaultToEndpointType;
        return this;
    }

    public void setDefaultToEndpointType(String defaultToEndpointType) {
        this.defaultToEndpointType = defaultToEndpointType;
    }

    public String getDefaultErrorEndpointType() {
        return defaultErrorEndpointType;
    }

    public Gateway defaultErrorEndpointType(String defaultErrorEndpointType) {
        this.defaultErrorEndpointType = defaultErrorEndpointType;
        return this;
    }

    public void setDefaultErrorEndpointType(String defaultErrorEndpointType) {
        this.defaultErrorEndpointType = defaultErrorEndpointType;
    }

    public Set<FlowRoute> getFlowRoutes() {
        return flowRoutes;
    }

    public Gateway flowRoutes(Set<FlowRoute> flowRoutes) {
        this.flowRoutes = flowRoutes;
        return this;
    }

    public Gateway addFlowRoute(FlowRoute flowRoute) {
        this.flowRoutes.add(flowRoute);
        flowRoute.setGateway(this);
        return this;
    }

    public Gateway removeFlowRoute(FlowRoute flowRoute) {
        this.flowRoutes.remove(flowRoute);
        flowRoute.setGateway(null);
        return this;
    }

    public void setFlowRoutes(Set<FlowRoute> flowRoutes) {
        this.flowRoutes = flowRoutes;
    }

    public Set<EnvironmentVariables> getEnvironmentVariables() {
        return environmentVariables;
    }

    public Gateway environmentVariables(Set<EnvironmentVariables> environmentVariables) {
        this.environmentVariables = environmentVariables;
        return this;
    }

    public Gateway addEnvironmentVariables(EnvironmentVariables environmentVariables) {
        this.environmentVariables.add(environmentVariables);
        environmentVariables.setGateway(this);
        return this;
    }

    public Gateway removeEnvironmentVariables(EnvironmentVariables environmentVariables) {
        this.environmentVariables.remove(environmentVariables);
        environmentVariables.setGateway(null);
        return this;
    }

    public void setEnvironmentVariables(Set<EnvironmentVariables> environmentVariables) {
        this.environmentVariables = environmentVariables;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Gateway gateway = (Gateway) o;
        if (gateway.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), gateway.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Gateway{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", type='" + getType() + "'" +
            ", environmentName='" + getEnvironmentName() + "'" +
            ", stage='" + getStage() + "'" +
            ", defaultFromEndpointType='" + getDefaultFromEndpointType() + "'" +
            ", defaultToEndpointType='" + getDefaultToEndpointType() + "'" +
            ", defaultErrorEndpointType='" + getDefaultErrorEndpointType() + "'" +
            "}";
    }
}
