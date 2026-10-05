package org.assimbly.gateway.domain;

import jakarta.persistence.*;

import java.io.Serial;
import java.io.Serializable;

/** A parameter of an Operation: in its path, its query or a header. Path parameters follow the path template. */
@Entity
@Table(name = "api_parameter")
public class ApiParameter implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator", sequenceName = "sequence_generator")
    @Column(name = "id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "operation_id")
    private ApiOperation operation;

    @Column(name = "name", nullable = false)
    private String name;

    /** {@code path}, {@code query} or {@code header}. */
    @Column(name = "location", nullable = false)
    private String location;

    /** {@code string}, {@code integer}, {@code number} or {@code boolean}. */
    @Column(name = "type")
    private String type;

    @Column(name = "required")
    private Boolean required;

    @Column(name = "description")
    private String description;

    public ApiParameter() {
    }

    public ApiParameter(String name, String location, String type, boolean required, String description) {
        this.name = name;
        this.location = location;
        this.type = type;
        this.required = required;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ApiOperation getOperation() {
        return operation;
    }

    public void setOperation(ApiOperation operation) {
        this.operation = operation;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRequired() {
        return Boolean.TRUE.equals(required);
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
