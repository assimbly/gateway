package org.assimbly.gateway.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.Objects;

import org.assimbly.gateway.domain.enumeration.ComponentType;

/**
 * A FromEndpoint.
 */
@Entity
@Table(name = "from_endpoint")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class FromEndpoint implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private ComponentType type;

    @Column(name = "uri")
    private String uri;

    @Column(name = "options")
    private String options;

    @ManyToOne
    private Service service;

    @ManyToOne
    private Header header;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ComponentType getType() {
        return type;
    }

    public FromEndpoint type(ComponentType type) {
        this.type = type;
        return this;
    }

    public void setType(ComponentType type) {
        this.type = type;
    }

    public String getUri() {
        return uri;
    }

    public FromEndpoint uri(String uri) {
        this.uri = uri;
        return this;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getOptions() {
        return options;
    }

    public FromEndpoint options(String options) {
        this.options = options;
        return this;
    }

    public void setOptions(String options) {
        this.options = options;
    }

    public Service getService() {
        return service;
    }

    public FromEndpoint service(Service service) {
        this.service = service;
        return this;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public Header getHeader() {
        return header;
    }

    public FromEndpoint header(Header header) {
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
        FromEndpoint fromEndpoint = (FromEndpoint) o;
        if (fromEndpoint.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), fromEndpoint.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "FromEndpoint{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", uri='" + getUri() + "'" +
            ", options='" + getOptions() + "'" +
            "}";
    }
}
