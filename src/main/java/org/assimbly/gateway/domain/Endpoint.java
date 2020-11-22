package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.Objects;

import org.assimbly.gateway.domain.enumeration.ComponentType;

/**
 * A Endpoint.
 */
@Entity
@Table(name = "endpoint")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Endpoint implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "componentType")
    private ComponentType componentType;

    @Column(name = "uri")
    private String uri;

    @Column(name = "options")
    private String options;

    @ManyToOne
    @JsonIgnoreProperties("endpoints")
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

    public ComponentType getComponentType() {
        return componentType;
    }

    public Endpoint componentType(ComponentType componentType) {
        this.componentType = componentType;
        return this;
    }

    public void setComponentType(ComponentType componentType) {
        this.componentType = componentType;
    }

    public String getUri() {
        return uri;
    }

    public Endpoint uri(String uri) {
        this.uri = uri;
        return this;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getOptions() {
        return options;
    }

    public Endpoint options(String options) {
        this.options = options;
        return this;
    }

    public void setOptions(String options) {
        this.options = options;
    }

    public Flow getFlow() {
        return flow;
    }

    public Endpoint flow(Flow flow) {
        this.flow = flow;
        return this;
    }

    public void setFlow(Flow flow) {
        this.flow = flow;
    }

    public Service getService() {
        return service;
    }

    public Endpoint service(Service service) {
        this.service = service;
        return this;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public Header getHeader() {
        return header;
    }

    public Endpoint header(Header header) {
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
        Endpoint endpoint = (Endpoint) o;
        if (endpoint.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), endpoint.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Endpoint{" +
            "id=" + getId() +
            ", componentType='" + getComponentType() + "'" +
            ", uri='" + getUri() + "'" +
            ", options='" + getOptions() + "'" +
            "}";
    }
}
