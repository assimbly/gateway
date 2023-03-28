package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the EnvironmentVariables entity.
 */
public class EnvironmentVariablesDTO implements Serializable {

    private Long id;

    private String key;

    private String value;

    private Boolean encrypted;

    private Long integrationId;

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

    public Boolean isEncrypted() {
        return encrypted;
    }

    public void setEncrypted(Boolean encrypted) {
        this.encrypted = encrypted;
    }

    public Long getIntegrationId() {
        return integrationId;
    }

    public void setIntegrationId(Long integrationId) {
        this.integrationId = integrationId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        EnvironmentVariablesDTO environmentVariablesDTO = (EnvironmentVariablesDTO) o;
        if (environmentVariablesDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), environmentVariablesDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "EnvironmentVariablesDTO{" +
            "id=" + getId() +
            ", key='" + getKey() + "'" +
            ", value='" + getValue() + "'" +
            ", integration=" + getIntegrationId() +
            "}";
    }
}
