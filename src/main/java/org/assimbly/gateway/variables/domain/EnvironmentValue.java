package org.assimbly.gateway.variables.domain;


import org.bson.types.ObjectId;

public class EnvironmentValue {

    public static final String ID_FIELD = "_id";
    public static final String ENVIRONMENT_FIELD = "environment";
    public static final String VALUE_FIELD = "value";
    public static final String ENCRYPTED_FIELD = "encrypted";
    public static final String NONCE_FIELD = "nonce";
    public static final String LAST_UPDATE_FIELD = "last_update";
    public static final String UPDATED_BY_FIELD = "updatedBy";

    private ObjectId _id;

    private String environment;
    private String value;

    private String nonce;
    private boolean encrypted;

    private long lastUpdate;
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

    public ObjectId get_id() {
        return _id;
    }

    public void set_id(ObjectId _id) {
        this._id = _id;
    }

    public long getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(long lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
