package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import org.assimbly.gateway.domain.enumeration.StepType;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

/**
 * A Step.
 */
@Entity
@Table(name = "step")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Step implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(generator = "sequenceGenerator")
    @GenericGenerator(strategy = "enhanced-sequence", name = "sequenceGenerator", parameters = {
        @Parameter(name = "initial_value", value = "1"),
        @Parameter(name = "increment_size", value = "1")})
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

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
    @JsonIgnore
    private Flow flow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connectionId")
    private Connection connection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "messageId")
    private Message message;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "step", cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.REFRESH})
    private Set<Link> links = new HashSet<>();

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

    public Step name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
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

    public Connection getConnection() {
        return connection;
    }

    public Step connection(Connection connection) {
        this.connection = connection;
        return this;
    }

    public void setConnection(Connection connection) {
        this.connection = connection;
    }

    public Message getMessage() {
        return message;
    }

    public Step message(Message message) {
        this.message = message;
        return this;
    }

    public void setMessage(Message message) {
        this.message = message;
    }


    public Set<Link> getLinks() {
        return links;
    }

    public Step links(Set<Link> links) {
        this.links = links;
        return this;
    }

    public Step addLink(Link link) {
        this.links.add(link);
        return this;
    }

    public Step removeLink(Link links) {
        this.links.remove(links);
        return this;
    }

    public void setLinks(Set<Link> links) {
        this.links = links;
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
