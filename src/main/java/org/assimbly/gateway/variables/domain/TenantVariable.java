package org.assimbly.gateway.variables.domain;

import org.mongodb.morphia.annotations.*;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Entity(concern = "TenantVariable", noClassnameStored = true, value = "tenant_variables")
@Indexes(
        @Index(value = "name", fields = @Field("name"))
)
public class TenantVariable {
    @Id
    private ObjectId _id;
    private String name;
    private long createdAt;
    private String createdBy;

    @Embedded
    private List<EnvironmentValue> values;

    public TenantVariable(){
        this._id = new ObjectId();
        this.values = new ArrayList<>();
    }

    public TenantVariable(String name){
        this._id = new ObjectId();
        this.name = name;
        this.values = new ArrayList<>();
    }

    public List<EnvironmentValue> getValues() {
        return values;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Optional<EnvironmentValue> find(String environment) {
        return values.stream()
                .filter(v -> v.getEnvironment().equals(environment))
                .findFirst();
    }

    public void put(EnvironmentValue environmentValue) {
        values.add(environmentValue);
    }
}
