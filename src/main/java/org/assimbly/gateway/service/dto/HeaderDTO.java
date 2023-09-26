package org.assimbly.gateway.service.dto;

import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the Header entity.
 */
public class HeaderDTO implements Serializable {

    private Long id;
    private String key;
    private String value;
    private String type;
    private String language;
    private Long messageId;

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

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        HeaderDTO headerDTO = (HeaderDTO) o;
        if (headerDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), headerDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "HeaderDTO{" +
            "id=" + getId() +
            ", key='" + getKey() + "'" +
            ", value='" + getValue() + "'" +
            ", type='" + getType() + "'" +
            ", messageId=" + getMessageId() +
            "}";
    }
}
