package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A Connection.
 */
@Entity
@Table(name = "connection")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Connection implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "type")
    private String type;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "connection", cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.REFRESH})
    @JsonIgnore
    private Set<ConnectionKeys> connectionKeys = new HashSet<>();

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

    public Connection name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public Connection type(String type) {
        this.type = type;
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Set<ConnectionKeys> getConnectionKeys() {
        return connectionKeys;
    }

    public Connection connectionKeys(Set<ConnectionKeys> connectionKeys) {
        this.connectionKeys = connectionKeys;
        return this;
    }

    public Connection addConnectionKeys(ConnectionKeys connectionKeys) {
        this.connectionKeys.add(connectionKeys);
        connectionKeys.setConnection(this);
        return this;
    }

    public Connection removeConnectionKeys(ConnectionKeys connectionKeys) {
        this.connectionKeys.remove(connectionKeys);
        connectionKeys.setConnection(null);
        return this;
    }

    public void setConnectionKeys(Set<ConnectionKeys> connectionKeys) {
        this.connectionKeys = connectionKeys;
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
        Connection connection = (Connection) o;
        if (connection.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), connection.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Connection{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", type='" + getType() + "'" +
            "}";
    }
}
