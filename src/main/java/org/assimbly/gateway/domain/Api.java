package org.assimbly.gateway.domain;

import jakarta.persistence.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * A REST interface that Assimbly serves: Operations under one base path, with a name and a version label.
 * Each Operation is handled by its own Handler Flow; the API itself never runs.
 */
@Entity
@Table(name = "api")
public class Api implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator", sequenceName = "sequence_generator")
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "base_path", nullable = false)
    private String basePath;

    @Column(name = "version_label")
    private String versionLabel;

    @Lob
    @Column(name = "description")
    private String description;

    @ManyToOne
    @JoinColumn(name = "integration_id")
    private Integration integration;

    @OneToMany(mappedBy = "api", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<ApiOperation> operations = new ArrayList<>();

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

    public String getBasePath() {
        return basePath;
    }

    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }

    public String getVersionLabel() {
        return versionLabel;
    }

    public void setVersionLabel(String versionLabel) {
        this.versionLabel = versionLabel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integration getIntegration() {
        return integration;
    }

    public void setIntegration(Integration integration) {
        this.integration = integration;
    }

    public List<ApiOperation> getOperations() {
        return operations;
    }

    public void addOperation(ApiOperation operation) {
        operations.add(operation);
        operation.setApi(this);
    }

    public void removeOperation(ApiOperation operation) {
        operations.remove(operation);
        operation.setApi(null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Api api) || api.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), api.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Api{id=" + id + ", name='" + name + "', basePath='" + basePath + "'}";
    }
}
