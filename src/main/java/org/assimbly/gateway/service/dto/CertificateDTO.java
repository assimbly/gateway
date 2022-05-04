package org.assimbly.gateway.service.dto;

import java.time.Instant;
import java.io.Serializable;
import java.util.Objects;
import javax.persistence.Lob;

/**
 * A DTO for the Certificate entity.
 */
public class CertificateDTO implements Serializable {

    private Long id;

    private String url;

    private String certificateName;

    private String certificateStore;

    private Instant certificateExpiry;

    @Lob
    private String certificateFile;

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

    public String getCertificateStore() {
        return certificateStore;
    }

    public void setCertificateStore(String certificateStore) {
        this.certificateStore = certificateStore;
    }

    public Instant getCertificateExpiry() {
        return certificateExpiry;
    }

    public void setCertificateExpiry(Instant certificateExpiry) {
        this.certificateExpiry = certificateExpiry;
    }

    public String getCertificateFile() {
        return certificateFile;
    }

    public void setCertificateFile(String certificateFile) {
        this.certificateFile = certificateFile;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        CertificateDTO certificateDTO = (CertificateDTO) o;
        if (certificateDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), certificateDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "CertificateDTO{" +
            "id=" + getId() +
            ", url='" + getUrl() + "'" +
            ", certificateName='" + getCertificateName() + "'" +
            ", certificateStore='" + getCertificateStore() + "'" +
            ", certificateExpiry='" + getCertificateExpiry() + "'" +
            ", certificateFile='" + getCertificateFile() + "'" +
            "}";
    }
}
