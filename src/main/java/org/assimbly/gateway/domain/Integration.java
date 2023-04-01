package org.assimbly.gateway.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import org.assimbly.gateway.domain.enumeration.GatewayType;

import org.assimbly.gateway.domain.enumeration.EnvironmentType;

import org.assimbly.gateway.domain.enumeration.ConnectorType;

/**
 * A Integration.
 */
@Entity
@Table(name = "integration")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Integration implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private GatewayType type;

    @Column(name = "environment_name")
    private String environmentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage")
    private EnvironmentType stage;

    @Enumerated(EnumType.STRING)
    @Column(name = "connector_type")
    private ConnectorType connectorType;

    @Column(name = "default_from_component_type")
    private String defaultFromComponentType;

    @Column(name = "default_to_component_type")
    private String defaultToComponentType;

    @Column(name = "default_error_component_type")
    private String defaultErrorComponentType;

    @OneToMany(mappedBy = "integration")
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Flow> flows = new HashSet<>();

    @OneToMany(mappedBy = "integration")
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<EnvironmentVariables> environmentVariables = new HashSet<>();

    //@ManyToMany
    //private Set<Group> groups = new HashSet<>();

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

    public Integration name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GatewayType getType() {
        return type;
    }

    public Integration type(GatewayType type) {
        this.type = type;
        return this;
    }

    public void setType(GatewayType type) {
        this.type = type;
    }

    public String getEnvironmentName() {
        return environmentName;
    }

    public Integration environmentName(String environmentName) {
        this.environmentName = environmentName;
        return this;
    }

    public void setEnvironmentName(String environmentName) {
        this.environmentName = environmentName;
    }

    public EnvironmentType getStage() {
        return stage;
    }

    public Integration stage(EnvironmentType stage) {
        this.stage = stage;
        return this;
    }

    public void setStage(EnvironmentType stage) {
        this.stage = stage;
    }

    public ConnectorType getConnectorType() {
        return connectorType;
    }

    public Integration connectorType(ConnectorType connectorType) {
        this.connectorType = connectorType;
        return this;
    }

    public void setConnectorType(ConnectorType connectorType) {
        this.connectorType = connectorType;
    }

    public String getDefaultFromComponentType() {
        return defaultFromComponentType;
    }

    public Integration defaultFromComponentType(String defaultFromComponentType) {
        this.defaultFromComponentType = defaultFromComponentType;
        return this;
    }

    public void setDefaultFromComponentType(String defaultFromComponentType) {
        this.defaultFromComponentType = defaultFromComponentType;
    }

    public String getDefaultToComponentType() {
        return defaultToComponentType;
    }

    public Integration defaultToComponentType(String defaultToComponentType) {
        this.defaultToComponentType = defaultToComponentType;
        return this;
    }

    public void setDefaultToComponentType(String defaultToComponentType) {
        this.defaultToComponentType = defaultToComponentType;
    }

    public String getDefaultErrorComponentType() {
        return defaultErrorComponentType;
    }

    public Integration defaultErrorComponentType(String defaultErrorComponentType) {
        this.defaultErrorComponentType = defaultErrorComponentType;
        return this;
    }

    public void setDefaultErrorComponentType(String defaultErrorComponentType) {
        this.defaultErrorComponentType = defaultErrorComponentType;
    }

    public Set<Flow> getFlows() {
        return flows;
    }

    public Integration flows(Set<Flow> flows) {
        this.flows = flows;
        return this;
    }

    public Integration addFlow(Flow flow) {
        this.flows.add(flow);
        flow.setIntegration(this);
        return this;
    }

    public Integration removeFlow(Flow flow) {
        this.flows.remove(flow);
        flow.setIntegration(null);
        return this;
    }

    public void setFlows(Set<Flow> flows) {
        this.flows = flows;
    }

    public Set<EnvironmentVariables> getEnvironmentVariables() {
        return environmentVariables;
    }

    public Integration environmentVariables(Set<EnvironmentVariables> environmentVariables) {
        this.environmentVariables = environmentVariables;
        return this;
    }

    public Integration addEnvironmentVariables(EnvironmentVariables environmentVariables) {
        this.environmentVariables.add(environmentVariables);
        environmentVariables.setIntegration(this);
        return this;
    }

    public Integration removeEnvironmentVariables(EnvironmentVariables environmentVariables) {
        this.environmentVariables.remove(environmentVariables);
        environmentVariables.setIntegration(null);
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
        Integration integration = (Integration) o;
        if (integration.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), integration.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "integration{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", type='" + getType() + "'" +
            ", environmentName='" + getEnvironmentName() + "'" +
            ", stage='" + getStage() + "'" +
            ", connectorType='" + getConnectorType() + "'" +
            ", defaultFromComponentType='" + getDefaultFromComponentType() + "'" +
            ", defaultToComponentType='" + getDefaultToComponentType() + "'" +
            ", defaultErrorComponentType='" + getDefaultErrorComponentType() + "'" +
            "}";
    }
}
