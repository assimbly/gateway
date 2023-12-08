package org.assimbly.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import java.io.Serializable;
import java.util.Objects;

/**
 * A Link.
 */
@Entity
@Table(name = "link")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Link implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(generator = "sequenceGenerator")
    @GenericGenerator(strategy = "enhanced-sequence", name = "sequenceGenerator", parameters = {
        @Parameter(name = "initial_value", value = "1"),
        @Parameter(name = "increment_size", value = "1")})
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "bound")
    private String bound;

    @Column(name = "transport")
    private String transport;

    @Column(name = "rule")
    private String rule;

    @Column(name = "expression")
    private String expression;
    @Column(name = "point")
    private String point;

    @Column(name = "format")
    private String format;

    @Column(name = "pattern")
    private String pattern;

    @ManyToOne
    @JsonIgnore
    private Step step;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public Link name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBound() {
        return bound;
    }

    public Link bound(String bound) {
        this.bound = bound;
        return this;
    }

    public void setBound(String bound) {
        this.bound = bound;
    }

    public String getTransport() {
        return transport;
    }

    public Link transport(String transport) {
        this.transport = transport;
        return this;
    }

    public void setTransport(String transport) {
        this.transport = transport;
    }

    public String getRule() {
        return rule;
    }

    public Link rule(String rule) {
        this.rule = rule;
        return this;
    }

    public void setRule(String rule) {
        this.rule = rule;
    }

    public String getExpression() {
        return expression;
    }

    public Link expression(String expression) {
        this.expression = expression;
        return this;
    }

    public void setExpression(String expression) {
        this.expression = expression;
    }

    public String getPoint() {
        return point;
    }

    public Link point(String point) {
        this.point = point;
        return this;
    }

    public void setPoint(String point) {
        this.point = point;
    }

    public String getFormat() {
        return format;
    }

    public Link format(String format) {
        this.format = format;
        return this;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getPattern() {
        return pattern;
    }

    public Link pattern(String pattern) {
        this.pattern = pattern;
        return this;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public Step getStep() {
        return step;
    }

    public Link step(Step step) {
        this.step = step;
        return this;
    }

    public void setStep(Step step) {
        this.step = step;
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
        Link link = (Link) o;
        if (link.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), link.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Links{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", bound='" + getBound() + "'" +
            ", transport='" + getTransport() + "'" +
            ", rule='" + getRule() + "'" +
            ", expression='" + getExpression() + "'" +
            ", point='" + getPoint() + "'" +
            ", format='" + getFormat() + "'" +
            ", pattern='" + getPattern() + "'" +
            "}";
    }
}
