package org.assimbly.gateway.domain;

import jakarta.persistence.*;

import java.io.Serial;
import java.io.Serializable;

/**
 * One answer an Operation promises in its contract: a status code (or {@code default}) with a description and,
 * optionally, a media type and schema. What actually answers is the Response Sink in the Handler Flow.
 */
@Entity
@Table(name = "api_declared_response")
public class ApiDeclaredResponse implements Serializable {

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

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "description")
    private String description;

    @Column(name = "media_type")
    private String mediaType;

    @Lob
    @Column(name = "schema")
    private String schema;

    public ApiDeclaredResponse() {
    }

    public ApiDeclaredResponse(String status, String description, String mediaType, String schema) {
        this.status = status;
        this.description = description;
        this.mediaType = mediaType;
        this.schema = schema;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }
}
