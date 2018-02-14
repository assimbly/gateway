package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A CamelRoute.
 */
@Entity
@Table(name = "camel_route")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class CamelRoute implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @ManyToOne
    private Gateway gateway;

    @OneToOne
    @JoinColumn(unique = true)
    private FromEndpoint fromEndpoint;

    @OneToOne
    @JoinColumn(unique = true)
    private ErrorEndpoint errorEndpoint;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "camelRoute")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<ToEndpoint> toEndpoints = new HashSet<>();

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

    public CamelRoute name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Gateway getGateway() {
        return gateway;
    }

    public CamelRoute gateway(Gateway gateway) {
        this.gateway = gateway;
        return this;
    }

    public void setGateway(Gateway gateway) {
        this.gateway = gateway;
    }

    public FromEndpoint getFromEndpoint() {
        return fromEndpoint;
    }

    public CamelRoute fromEndpoint(FromEndpoint fromEndpoint) {
        this.fromEndpoint = fromEndpoint;
        return this;
    }

    public void setFromEndpoint(FromEndpoint fromEndpoint) {
        this.fromEndpoint = fromEndpoint;
    }

    public ErrorEndpoint getErrorEndpoint() {
        return errorEndpoint;
    }

    public CamelRoute errorEndpoint(ErrorEndpoint errorEndpoint) {
        this.errorEndpoint = errorEndpoint;
        return this;
    }

    public void setErrorEndpoint(ErrorEndpoint errorEndpoint) {
        this.errorEndpoint = errorEndpoint;
    }

    public Set<ToEndpoint> getToEndpoints() {
        return toEndpoints;
    }

    public CamelRoute toEndpoints(Set<ToEndpoint> toEndpoints) {
        this.toEndpoints = toEndpoints;
        return this;
    }

    public CamelRoute addToEndpoint(ToEndpoint toEndpoint) {
        this.toEndpoints.add(toEndpoint);
        toEndpoint.setCamelRoute(this);
        return this;
    }

    public CamelRoute removeToEndpoint(ToEndpoint toEndpoint) {
        this.toEndpoints.remove(toEndpoint);
        toEndpoint.setCamelRoute(null);
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
        CamelRoute camelRoute = (CamelRoute) o;
        if (camelRoute.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), camelRoute.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "CamelRoute{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
