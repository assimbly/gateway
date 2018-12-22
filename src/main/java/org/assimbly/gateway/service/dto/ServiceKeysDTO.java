package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the ServiceKeys entity.
 */
public class ServiceKeysDTO implements Serializable {

    private Long id;

    private String key;

    private String value;

    private Long serviceKeysId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Long getServiceKeysId() {
        return serviceKeysId;
    }

    public void setServiceKeysId(Long serviceId) {
        this.serviceKeysId = serviceId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ServiceKeysDTO serviceKeysDTO = (ServiceKeysDTO) o;
        if (serviceKeysDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), serviceKeysDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ServiceKeysDTO{" +
            "id=" + getId() +
            ", key='" + getKey() + "'" +
            ", value='" + getValue() + "'" +
            ", serviceKeys=" + getServiceKeysId() +
            "}";
    }
}
