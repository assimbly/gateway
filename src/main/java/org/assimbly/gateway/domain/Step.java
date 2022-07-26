package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.Objects;

import org.assimbly.gateway.domain.enumeration.StepType;

/**
 * A Step.
 */
@Entity
@Table(name = "step")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Step implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "stepType")
    private StepType stepType;

    @Column(name = "componentType")
    private String componentType;

    @Column(name = "uri")
    private String uri;

    @Column(name = "options")
    private String options;

    @Column(name = "responseId")
    private Integer responseId;

    @Column(name = "routeId")
    private Integer routeId;

    @ManyToOne
    @JsonIgnoreProperties("steps")
    private Flow flow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serviceId")
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "headerId")
    private Header header;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StepType getStepType() {
        return stepType;
    }

    public Step stepType(StepType stepType) {
        this.stepType = stepType;
        return this;
    }

    public void setStepType(StepType stepType) {
        this.stepType = stepType;
    }

    public String getComponentType() {
        return componentType;
    }

    public Step componentType(String componentType) {
        this.componentType = componentType;
        return this;
    }

    public void setComponentType(String componentType) {
        this.componentType = componentType;
    }

    public String getUri() {
        return uri;
    }

    public Step uri(String uri) {
        this.uri = uri;
        return this;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getOptions() {
        return options;
    }

    public Step options(String options) {
        this.options = options;
        return this;
    }

    public void setOptions(String options) {
        this.options = options;
    }

    public Integer getRouteId() {
        return routeId;
    }

    public Step routeId(Integer routeId) {
        this.routeId = routeId;
        return this;
    }

    public void setRouteId(Integer routeId) {
        this.routeId = routeId;
    }

    public Integer getResponseId() {
        return responseId;
    }

    public Step responseId(Integer responseId) {
        this.responseId = responseId;
        return this;
    }

    public void setResponseId(Integer responseId) {
        this.responseId = responseId;
    }

    public Flow getFlow() {
        return flow;
    }

    public Step flow(Flow flow) {
        this.flow = flow;
        return this;
    }

    public void setFlow(Flow flow) {
        this.flow = flow;
    }

    public Service getService() {
        return service;
    }

    public Step service(Service service) {
        this.service = service;
        return this;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public Header getHeader() {
        return header;
    }

    public Step header(Header header) {
        this.header = header;
        return this;
    }

    public void setHeader(Header header) {
        this.header = header;
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
        Step step = (Step) o;
        if (step.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), step.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Step{" +
            "id=" + getId() +
            ", stepType='" + getStepType() + "'" +
            ", componentType='" + getComponentType() + "'" +
            ", uri='" + getUri() + "'" +
            ", options='" + getOptions() + "'" +
            ", responseId='" + getResponseId() + "'" +
            "}";
    }
}
