package org.assimbly.gateway.service.dto;

import java.time.Instant;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the Security entity.
 */
public class SecurityDTO implements Serializable {

    private Long id;

    private String url;

    private String certificateName;

    private Instant certificateExpiry;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCertificateName() {
        return certificateName;
    }

    public void setCertificateName(String certificateName) {
        this.certificateName = certificateName;
    }

    public Instant getCertificateExpiry() {
        return certificateExpiry;
    }

    public void setCertificateExpiry(Instant certificateExpiry) {
        this.certificateExpiry = certificateExpiry;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        SecurityDTO securityDTO = (SecurityDTO) o;
        if (securityDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), securityDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "SecurityDTO{" +
            "id=" + getId() +
            ", url='" + getUrl() + "'" +
            ", certificateName='" + getCertificateName() + "'" +
            ", certificateExpiry='" + getCertificateExpiry() + "'" +
            "}";
    }
}
