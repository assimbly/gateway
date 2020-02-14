package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A Flow.
 */
@Entity
@Table(name = "flow")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Flow implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "auto_start")
    private Boolean autoStart;

    @Column(name = "off_loading")
    private Boolean offLoading;

    @Column(name = "maximum_redeliveries")
    private Integer maximumRedeliveries;

    @Column(name = "redelivery_delay")
    private Integer redeliveryDelay;

    @Column(name = "type")
    private String type;

    @Column(name = "load_balancing")
    private Boolean loadBalancing;

    @Column(name = "instances")
    private Integer instances;

    @ManyToOne
    @JsonIgnoreProperties("flows")
    private Gateway gateway;
 
    @OneToOne(cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn(unique = true)
    private FromEndpoint fromEndpoint;
 
    @OneToOne(cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn(unique = true)
    private ErrorEndpoint errorEndpoint;
 
    @OneToMany(fetch = FetchType.EAGER, mappedBy = "flow",cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.REFRESH})
    @JsonIgnore
    private Set<ToEndpoint> toEndpoints = new HashSet<>();
    
    /*
    @OneToOne(cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn(unique = true)
    private Maintenance maintenance; 
    */ 
    
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

    public Flow name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean isAutoStart() {
        return autoStart;
    }

    public Flow autoStart(Boolean autoStart) {
        this.autoStart = autoStart;
        return this;
    }

    public void setAutoStart(Boolean autoStart) {
        this.autoStart = autoStart;
    }

    public Boolean isOffLoading() {
        return offLoading;
    }

    public Flow offLoading(Boolean offLoading) {
        this.offLoading = offLoading;
        return this;
    }

    public void setOffLoading(Boolean offLoading) {
        this.offLoading = offLoading;
    }

    public Integer getMaximumRedeliveries() {
        return maximumRedeliveries;
    }

    public Flow maximumRedeliveries(Integer maximumRedeliveries) {
        this.maximumRedeliveries = maximumRedeliveries;
        return this;
    }

    public void setMaximumRedeliveries(Integer maximumRedeliveries) {
        this.maximumRedeliveries = maximumRedeliveries;
    }

    public Integer getRedeliveryDelay() {
        return redeliveryDelay;
    }

    public Flow redeliveryDelay(Integer redeliveryDelay) {
        this.redeliveryDelay = redeliveryDelay;
        return this;
    }

    public void setRedeliveryDelay(Integer redeliveryDelay) {
        this.redeliveryDelay = redeliveryDelay;
    }

    public String getType() {
        return type;
    }

    public Flow type(String type) {
        this.type = type;
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean isLoadBalancing() {
        return loadBalancing;
    }

    public Flow loadBalancing(Boolean loadBalancing) {
        this.loadBalancing = loadBalancing;
        return this;
    }

    public void setLoadBalancing(Boolean loadBalancing) {
        this.loadBalancing = loadBalancing;
    }

    public Integer getInstances() {
        return instances;
    }

    public Flow instances(Integer instances) {
        this.instances = instances;
        return this;
    }

    public void setInstances(Integer instances) {
        this.instances = instances;
    }

    public Gateway getGateway() {
        return gateway;
    }

    public Flow gateway(Gateway gateway) {
        this.gateway = gateway;
        return this;
    }

    public void setGateway(Gateway gateway) {
        this.gateway = gateway;
    }

    public FromEndpoint getFromEndpoint() {
        return fromEndpoint;
    }

    public Flow fromEndpoint(FromEndpoint fromEndpoint) {
        this.fromEndpoint = fromEndpoint;
        return this;
    }

    public void setFromEndpoint(FromEndpoint fromEndpoint) {
        this.fromEndpoint = fromEndpoint;
    }

    public ErrorEndpoint getErrorEndpoint() {
        return errorEndpoint;
    }

    public Flow errorEndpoint(ErrorEndpoint errorEndpoint) {
        this.errorEndpoint = errorEndpoint;
        return this;
    }

    public void setErrorEndpoint(ErrorEndpoint errorEndpoint) {
        this.errorEndpoint = errorEndpoint;
    }

    public Set<ToEndpoint> getToEndpoints() {
        return toEndpoints;
    }

    public Flow toEndpoints(Set<ToEndpoint> toEndpoints) {
        this.toEndpoints = toEndpoints;
        return this;
    }

    public Flow addToEndpoint(ToEndpoint toEndpoint) {
        this.toEndpoints.add(toEndpoint);
        toEndpoint.setFlow(this);
        return this;
    }

    public Flow removeToEndpoint(ToEndpoint toEndpoint) {
        this.toEndpoints.remove(toEndpoint);
        toEndpoint.setFlow(null);
        return this;
    }

    public void setToEndpoints(Set<ToEndpoint> toEndpoints) {
        this.toEndpoints = toEndpoints;
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
        Flow flow = (Flow) o;
        if (flow.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), flow.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Flow{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", autoStart='" + isAutoStart() + "'" +
            ", offLoading='" + isOffLoading() + "'" +
            ", maximumRedeliveries=" + getMaximumRedeliveries() +
            ", redeliveryDelay=" + getRedeliveryDelay() +
            ", type='" + getType() + "'" +
            ", loadBalancing='" + isLoadBalancing() + "'" +
            ", instances=" + getInstances() +
            "}";
    }
}
