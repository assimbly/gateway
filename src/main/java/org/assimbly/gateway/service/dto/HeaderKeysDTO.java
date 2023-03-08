package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the HeaderKeys entity.
 */
public class HeaderKeysDTO implements Serializable {

    private Long id;
    private String key;
    private String value;
    private String type;

    private String language;
    private Long headerId;

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Long getHeaderId() {
        return headerId;
    }

    public void setHeaderId(Long headerId) {
        this.headerId = headerId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        HeaderKeysDTO headerKeysDTO = (HeaderKeysDTO) o;
        if (headerKeysDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), headerKeysDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "HeaderKeysDTO{" +
            "id=" + getId() +
            ", key='" + getKey() + "'" +
            ", value='" + getValue() + "'" +
            ", type='" + getType() + "'" +
            ", header=" + getHeaderId() +
            "}";
    }
}
