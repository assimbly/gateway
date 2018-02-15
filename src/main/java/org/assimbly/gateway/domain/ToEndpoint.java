package org.assimbly.gateway.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.Objects;

import org.assimbly.gateway.domain.enumeration.EndpointType;

/**
 * A ToEndpoint.
 */
@Entity
@Table(name = "to_endpoint")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class ToEndpoint implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "jhi_type")
    private EndpointType type;

    @Column(name = "uri")
    private String uri;

    @Column(name = "options")
    private String options;

    @ManyToOne
    private CamelRoute camelRoute;

    @OneToOne
    @JoinColumn(unique = true)
    private Service service;

    @OneToOne
    @JoinColumn(unique = true)
    private Header header;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EndpointType getType() {
        return type;
    }

    public ToEndpoint type(EndpointType type) {
        this.type = type;
        return this;
    }

    public void setType(EndpointType type) {
        this.type = type;
    }

    public String getUri() {
        return uri;
    }

    public ToEndpoint uri(String uri) {
        this.uri = uri;
        return this;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getOptions() {
        return options;
    }

    public ToEndpoint options(String options) {
        this.options = options;
        return this;
    }

    public void setOptions(String options) {
        this.options = options;
    }

    public CamelRoute getCamelRoute() {
        return camelRoute;
    }

    public ToEndpoint camelRoute(CamelRoute camelRoute) {
        this.camelRoute = camelRoute;
        return this;
    }

    public void setCamelRoute(CamelRoute camelRoute) {
        this.camelRoute = camelRoute;
    }

    public Service getService() {
        return service;
    }

    public ToEndpoint service(Service service) {
        this.service = service;
        return this;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public Header getHeader() {
        return header;
    }

    public ToEndpoint header(Header header) {
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
        ToEndpoint toEndpoint = (ToEndpoint) o;
        if (toEndpoint.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), toEndpoint.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ToEndpoint{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", uri='" + getUri() + "'" +
            ", options='" + getOptions() + "'" +
            "}";
    }
}
