package org.assimbly.gateway.variables.domain;

import org.mongodb.morphia.annotations.*;
import org.bson.types.ObjectId;

@Entity("values")
public class EnvironmentValue {

    @Id
    private ObjectId _id;

    private String environment;
    private String value;

    private String nonce;
    private boolean encrypted;

    private long last_update;
    private String updatedBy;

    public EnvironmentValue() {}

    public EnvironmentValue(String environment) {
        this._id = new ObjectId();
        this.environment = environment;
        this.encrypted = false;
        this.value = "Unassigned";
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public boolean isEncrypted() {
        return encrypted;
    }

    public void setEncrypted(boolean encrypted) {
        this.encrypted = encrypted;
    }

    public String getNonce() {
        return nonce;
    }

    public void setNonce(String nonce) {
        this.nonce = nonce;
    }

    public void setUpdatedAt(long last_update) { this.last_update = last_update; }

    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
