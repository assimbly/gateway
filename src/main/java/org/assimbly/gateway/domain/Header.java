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
 * A Header.
 */
@Entity
@Table(name = "header")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Header implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @OneToMany(mappedBy = "header")
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<HeaderKeys> headerKeys = new HashSet<>();
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

    public Header name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<HeaderKeys> getHeaderKeys() {
        return headerKeys;
    }

    public Header headerKeys(Set<HeaderKeys> headerKeys) {
        this.headerKeys = headerKeys;
        return this;
    }

    public Header addHeaderKeys(HeaderKeys headerKeys) {
        this.headerKeys.add(headerKeys);
        headerKeys.setHeader(this);
        return this;
    }

    public Header removeHeaderKeys(HeaderKeys headerKeys) {
        this.headerKeys.remove(headerKeys);
        headerKeys.setHeader(null);
        return this;
    }

    public void setHeaderKeys(Set<HeaderKeys> headerKeys) {
        this.headerKeys = headerKeys;
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
        Header header = (Header) o;
        if (header.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), header.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Header{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
