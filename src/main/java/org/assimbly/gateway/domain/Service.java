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
 * A Service.
 */
@Entity
@Table(name = "service")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Service implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "jhi_type")
    private String type;
    
    @OneToMany(fetch = FetchType.EAGER, mappedBy = "service",cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<ServiceKeys> serviceKeys = new HashSet<>();
    
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

    public Service name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public Service type(String type) {
        this.type = type;
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }    
    
    public Set<ServiceKeys> getServiceKeys() {
        return serviceKeys;
    }

    public Service serviceKeys(Set<ServiceKeys> serviceKeys) {
        this.serviceKeys = serviceKeys;
        return this;
    }

    public Service addServiceKeys(ServiceKeys serviceKeys) {
        this.serviceKeys.add(serviceKeys);
        serviceKeys.setService(this);
        return this;
    }

    public Service removeServiceKeys(ServiceKeys serviceKeys) {
        this.serviceKeys.remove(serviceKeys);
        serviceKeys.setService(null);
        return this;
    }

    public void setServiceKeys(Set<ServiceKeys> serviceKeys) {
        this.serviceKeys = serviceKeys;
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
        Service service = (Service) o;
        if (service.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), service.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Service{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
