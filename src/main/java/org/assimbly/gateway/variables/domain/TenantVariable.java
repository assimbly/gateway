package org.assimbly.gateway.variables.domain;

import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class TenantVariable {

    public static final String ID_FIELD = "_id";
    public static final String NAME_FIELD = "name";
    public static final String CREATED_AT_FIELD = "createdAt";
    public static final String CREATED_BY_FIELD = "createdBy";
    public static final String VALUES_FIELD = "values";

    private String _id;
    private String name;
    private long createdAt;
    private String createdBy;

    private List<EnvironmentValue> values;

    public TenantVariable(){
        this._id = new ObjectId().toString();
        this.values = new ArrayList<>();
    }

    public TenantVariable(String name){
        this._id = new ObjectId().toString();
        this.name = name;
        this.values = new ArrayList<>();
    }

    public List<EnvironmentValue> getValues() {
        return values;
    }

    public Optional<EnvironmentValue> find(String environment) {
        return values.stream()
            .filter(v -> v.getEnvironment().equals(environment))
            .findFirst();
    }

    public void put(EnvironmentValue environmentValue) {
        values.add(environmentValue);
    }

    public static TenantVariable fromDocument(Document document) {
        TenantVariable tenantVariable = new TenantVariable();
        tenantVariable.set_id(document.getString(ID_FIELD));
        tenantVariable.setName(document.getString(NAME_FIELD));
        tenantVariable.setCreatedAt(document.getLong(CREATED_AT_FIELD));
        tenantVariable.setCreatedBy(document.getString(CREATED_BY_FIELD));

        List<Document> valuesList = (List<Document>) document.get(VALUES_FIELD);
        for (Document valueDoc : valuesList) {
            EnvironmentValue environmentValue = new EnvironmentValue();
            environmentValue.set_id(valueDoc.getString(EnvironmentValue.ID_FIELD));
            environmentValue.setEnvironment(valueDoc.getString(EnvironmentValue.ENVIRONMENT_FIELD));
            environmentValue.setValue(valueDoc.getString(EnvironmentValue.VALUE_FIELD));
            environmentValue.setEncrypted(valueDoc.getBoolean(EnvironmentValue.ENCRYPTED_FIELD).booleanValue());
            environmentValue.setLastUpdate(valueDoc.getLong(EnvironmentValue.LAST_UPDATE_FIELD).longValue());
            environmentValue.setUpdatedBy(valueDoc.getString(EnvironmentValue.UPDATED_BY_FIELD));
            tenantVariable.put(environmentValue);
        }

        return tenantVariable;
    }

    public Document toDocument() {
        Document document = new Document();
        document.append(ID_FIELD, this.get_id());
        document.append(NAME_FIELD, this.getName());
        document.append(CREATED_AT_FIELD, this.getCreatedAt());
        document.append(CREATED_BY_FIELD, this.getCreatedBy());

        List<Document> valuesList = new ArrayList<>();
        for (EnvironmentValue environmentValue : this.getValues()) {
            Document valueDoc = new Document();
            valueDoc.append(EnvironmentValue.ID_FIELD, environmentValue.get_id());
            valueDoc.append(EnvironmentValue.ENVIRONMENT_FIELD, environmentValue.getEnvironment());
            valueDoc.append(EnvironmentValue.VALUE_FIELD, environmentValue.getValue());
            valueDoc.append(EnvironmentValue.ENCRYPTED_FIELD, environmentValue.isEncrypted());
            valueDoc.append(EnvironmentValue.LAST_UPDATE_FIELD, environmentValue.getLastUpdate());
            valueDoc.append(EnvironmentValue.UPDATED_BY_FIELD, environmentValue.getUpdatedBy());
            valuesList.add(valueDoc);
        }
        document.append(VALUES_FIELD, valuesList);

        return document;
    }

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
