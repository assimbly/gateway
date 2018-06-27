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
 * A Group.
 */
@Entity
@Table(name = "group")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Group implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @ManyToMany(mappedBy = "groups")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Gateway> gateways = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "group_user",
               joinColumns = @JoinColumn(name="groups_id", referencedColumnName="id"),
               inverseJoinColumns = @JoinColumn(name="users_id", referencedColumnName="id"))
    private Set<User> users = new HashSet<>();

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

    public Group name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<Gateway> getGateways() {
        return gateways;
    }

    public Group gateways(Set<Gateway> gateways) {
        this.gateways = gateways;
        return this;
    }

    public Group addGateway(Gateway gateway) {
        this.gateways.add(gateway);
        gateway.getGroups().add(this);
        return this;
    }

    public Group removeGateway(Gateway gateway) {
        this.gateways.remove(gateway);
        gateway.getGroups().remove(this);
        return this;
    }

    public void setGateways(Set<Gateway> gateways) {
        this.gateways = gateways;
    }

    public Set<User> getUsers() {
        return users;
    }

    public Group users(Set<User> users) {
        this.users = users;
        return this;
    }

    public Group addUser(User user) {
        this.users.add(user);
        user.getGroups().add(this);
        return this;
    }

    public Group removeUser(User user) {
        this.users.remove(user);
        user.getGroups().remove(this);
        return this;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
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
        Group group = (Group) o;
        if (group.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), group.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Group{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
