package org.assimbly.gateway.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A certificate.
 */
@Entity
@Table(name = "certificate")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Certificate implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(generator = "sequenceGenerator")
    @GenericGenerator(strategy = "enhanced-sequence", name = "sequenceGenerator", parameters = {
        @Parameter(name = "initial_value", value = "1"),
        @Parameter(name = "increment_size", value = "1")})
    @Column(name = "id")
    private Long id;

    @Column(name = "url")
    private String url;

    @Column(name = "certificate_name")
    private String certificateName;

    @Column(name = "certificate_store")
    private String certificateStore;

    @Column(name = "certificate_expiry")
    private Instant certificateExpiry;

    @Lob
    @Column(name = "certificate_file")
    private String certificateFile;

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

    public Certificate url(String url) {
        this.url = url;
        return this;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCertificateName() {
        return certificateName;
    }

    public Certificate certificateName(String certificateName) {
        this.certificateName = certificateName;
        return this;
    }

    public void setCertificateStore(String certificateStore) {
        this.certificateStore = certificateStore;
    }

    public String getCertificateStore() {
        return certificateStore;
    }

    public Certificate certificateStore(String certificateStore) {
        this.certificateStore = certificateStore;
        return this;
    }

    public void setCertificateName(String certificateName) {
        this.certificateName = certificateName;
    }

    public Instant getCertificateExpiry() {
        return certificateExpiry;
    }

    public Certificate certificateExpiry(Instant certificateExpiry) {
        this.certificateExpiry = certificateExpiry;
        return this;
    }

    public void setCertificateExpiry(Instant certificateExpiry) {
        this.certificateExpiry = certificateExpiry;
    }

    public String getCertificateFile() {
        return certificateFile;
    }

    public Certificate certificateFile(String certificateFile) {
        this.certificateFile = certificateFile;
        return this;
    }

    public void setCertificateFile(String certificateFile) {
        this.certificateFile = certificateFile;
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
        Certificate certificate = (Certificate) o;
        if (certificate.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), certificate.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Certificate{" +
            "id=" + getId() +
            ", url='" + getUrl() + "'" +
            ", certificateName='" + getCertificateName() + "'" +
            ", certificateStore='" + getCertificateStore() + "'" +
            ", certificateExpiry='" + getCertificateExpiry() + "'" +
            ", certificateFile='" + getCertificateFile() + "'" +
            "}";
    }
}
