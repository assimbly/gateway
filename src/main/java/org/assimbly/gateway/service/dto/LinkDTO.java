package org.assimbly.gateway.service.dto;

import javax.persistence.Column;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the Link entity.
 */
public class LinkDTO implements Serializable {

    private Long id;

    private String name;

    private String bound;

    private String transport;

    private String rule;

    private String expression;

    private String point;

    private String format;

    private String pattern;
    private Long stepId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBound() {
        return bound;
    }

    public void setBound(String bound) {
        this.bound = bound;
    }

    public String getTransport() {
        return transport;
    }

    public void setTransport(String transport) {
        this.transport = transport;
    }

    public String getRule() {
        return rule;
    }

    public void setRule(String rule) {
        this.rule = rule;
    }

    public String getExpression() {
        return expression;
    }

    public void setExpression(String expression) {
        this.expression = expression;
    }

    public String getPoint() {
        return point;
    }

    public void setPoint(String point) {
        this.point = point;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }


    public Long getStepId() {
        return stepId;
    }

    public void setStepId(Long stepId) {
        this.stepId = stepId;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        LinkDTO linkDTO = (LinkDTO) o;
        if (linkDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), linkDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "LinkDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", bound='" + getBound() + "'" +
            ", transport='" + getTransport() + "'" +
            ", rule=" + getRule() +
            ", expression=" + getExpression() +
            ", point='" + getPoint() + "'" +
            ", format=" + getFormat() +
            ", pattern=" + getPattern() +
            "}";
    }
}
