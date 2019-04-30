package org.assimbly.gateway.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A Security.
 */
@Entity
@Table(name = "security")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Security implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url")
    private String url;

    @Column(name = "certificate_name")
    private String certificateName;

    @Column(name = "certificate_expiry")
    private Instant certificateExpiry;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public Security url(String url) {
        this.url = url;
        return this;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCertificateName() {
        return certificateName;
    }

    public Security certificateName(String certificateName) {
        this.certificateName = certificateName;
        return this;
    }

    public void setCertificateName(String certificateName) {
        this.certificateName = certificateName;
    }

    public Instant getCertificateExpiry() {
        return certificateExpiry;
    }

    public Security certificateExpiry(Instant certificateExpiry) {
        this.certificateExpiry = certificateExpiry;
        return this;
    }

    public void setCertificateExpiry(Instant certificateExpiry) {
        this.certificateExpiry = certificateExpiry;
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
        Security security = (Security) o;
        if (security.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), security.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Security{" +
            "id=" + getId() +
            ", url='" + getUrl() + "'" +
            ", certificateName='" + getCertificateName() + "'" +
            ", certificateExpiry='" + getCertificateExpiry() + "'" +
            "}";
    }
}
