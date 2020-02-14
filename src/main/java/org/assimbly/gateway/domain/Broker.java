package org.assimbly.gateway.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * A Broker.
 */
@Entity
@Table(name = "broker")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Broker implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "type")
    private String type;

    @Column(name = "configuration")
    private String configurationType;

    @Column(name = "auto_start")
    private Boolean autoStart;

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

    public Broker name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public Broker type(String type) {
        this.type = type;
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getConfigurationType() {
        return configurationType;
    }

    public Broker configurationType(String configurationType) {
        this.configurationType = configurationType;
        return this;
    }

    public void setConfigurationType(String configurationType) {
        this.configurationType = configurationType;
    }

    public Boolean isAutoStart() {
        return autoStart;
    }

    public Broker autoStart(Boolean autoStart) {
        this.autoStart = autoStart;
        return this;
    }

    public void setAutoStart(Boolean autoStart) {
        this.autoStart = autoStart;
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
        Broker broker = (Broker) o;
        if (broker.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), broker.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Broker{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", type='" + getType() + "'" +
            ", configurationType='" + getConfigurationType() + "'" +
            ", autoStart='" + isAutoStart() + "'" +
            "}";
    }
}
