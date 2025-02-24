package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.assimbly.gateway.domain.enumeration.LogLevelType;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import java.io.Serializable;
import java.time.Instant;
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
    @GeneratedValue(generator = "sequenceGenerator")
    @GenericGenerator(strategy = "enhanced-sequence", name = "sequenceGenerator", parameters = {
        @Parameter(name = "initial_value", value = "1"),
        @Parameter(name = "increment_size", value = "1")})
    @Column(name = "id")    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "auto_start")
    private Boolean autoStart;

    @Column(name = "maximum_redeliveries")
    private Integer maximumRedeliveries;

    @Column(name = "redelivery_delay")
    private Integer redeliveryDelay;

    @Column(name = "type")
    private String type;

    @Column(name = "notes")
    private String notes;

    @Column(name = "load_balancing")
    private Boolean loadBalancing;

    @Column(name = "parallel_processing")
    private Boolean parallelProcessing;

    @Column(name = "log_level")
    private LogLevelType logLevel;

    @Column(name = "instances")
    private Integer instances;

    @Column(name = "version")
    private Integer version;

    @Column(name = "created")
    private Instant created;

    @Column(name = "last_modified")
    private Instant lastModified;

    @ManyToOne
    @JsonIgnoreProperties("flows")
    private Integration integration;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "flow",cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.REFRESH})
    private Set<Step> steps = new HashSet<>();

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

    public String getNotes() {
        return notes;
    }

    public Flow notes(String notes) {
        this.notes = notes;
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public Boolean isParallelProcessing() {
        return parallelProcessing;
    }

    public Flow parallelProcessing(Boolean parallelProcessing) {
        this.parallelProcessing = parallelProcessing;
        return this;
    }

    public void setParallelProcessing(Boolean parallelProcessing) {
        this.parallelProcessing = parallelProcessing;
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

    public LogLevelType getLogLevel() {
        return logLevel;
    }

    public Flow logLevel(LogLevelType logLevel) {
        this.logLevel = logLevel;
        return this;
    }

    public void setLogLevel(LogLevelType logLevel) {
        this.logLevel = logLevel;
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

    public Integer getVersion() {
        return version;
    }

    public Flow version(Integer version) {
        this.version = version;
        return this;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Instant getCreated() {
        return created;
    }

    public Flow created(Instant created) {
        this.created = created;
        return this;
    }

    public void setCreated(Instant created) {
        this.created = created;
    }

    public Instant getLastModified() {
        return lastModified;
    }

    public Flow lastModified(Instant lastModified) {
        this.lastModified = lastModified;
        return this;
    }

    public void setLastModified(Instant lastModified) {
        this.lastModified = lastModified;
    }

    public Integration getIntegration() {
        return integration;
    }

    public Flow integration(Integration integration) {
        this.integration = integration;
        return this;
    }

    public void setIntegration(Integration integration) {
        this.integration = integration;
    }

    public Set<Step> getSteps() {
        return steps;
    }

    public Flow steps(Set<Step> steps) {
        this.steps = steps;
        return this;
    }


    public Flow addStep(Step step) {
        this.steps.add(step);
        step.setFlow(this);
        return this;
    }

    public Flow removeStep(Step step) {
        this.steps.remove(step);
        step.setFlow(null);
        return this;
    }

    public void setSteps(Set<Step> steps) {
        this.steps = steps;
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
            ", maximumRedeliveries=" + getMaximumRedeliveries() +
            ", redeliveryDelay=" + getRedeliveryDelay() +
            ", type='" + getType() + "'" +
            ", loadBalancing='" + isLoadBalancing() + "'" +
            ", parallelProcessing='" + isParallelProcessing() + "'" +
            ", instances=" + getInstances() +
            "}";
    }
}
