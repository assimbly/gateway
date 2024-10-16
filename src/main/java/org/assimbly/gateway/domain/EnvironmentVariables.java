package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import java.io.Serializable;
import java.util.Objects;

/**
 * A EnvironmentVariables.
 */
@Entity
@Table(name = "environment_variables")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class EnvironmentVariables implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(generator = "sequenceGenerator")
    @GenericGenerator(strategy = "enhanced-sequence", name = "sequenceGenerator", parameters = {
        @Parameter(name = "initial_value", value = "1"),
        @Parameter(name = "increment_size", value = "1")})
    @Column(name = "id")
    private Long id;

    @Column(name = "jhi_key")
    private String key;

    @Column(name = "`value`")
    private String value;

    @Column(name = "encrypted")
    private Boolean encrypted;

    @ManyToOne
    @JsonIgnoreProperties("environmentVariables")
    private Integration integration;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public EnvironmentVariables key(String key) {
        this.key = key;
        return this;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public EnvironmentVariables value(String value) {
        this.value = value;
        return this;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Boolean isEncrypted() {
        return encrypted;
    }

    public void setEncrypted(Boolean encrypted) {
        this.encrypted = encrypted;
    }

    public Integration getIntegration() {
        return integration;
    }

    public EnvironmentVariables integration(Integration integration) {
        this.integration = integration;
        return this;
    }

    public void setIntegration(Integration integration) {
        this.integration = integration;
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
        EnvironmentVariables environmentVariables = (EnvironmentVariables) o;
        if (environmentVariables.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), environmentVariables.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "EnvironmentVariables{" +
            "id=" + getId() +
            ", key='" + getKey() + "'" +
            ", value='" + getValue() + "'" +
            ", encrypt='" + isEncrypted() + "'" +
            "}";
    }
}
