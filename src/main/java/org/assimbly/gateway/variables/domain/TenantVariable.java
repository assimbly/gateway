package org.assimbly.gateway.variables.domain;

import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class TenantVariable {

    public static final String ID_FIELD = "_id";
    public static final String TYPE_FIELD = "_type";
    public static final String NAME_FIELD = "name";
    public static final String PROTECTED_VALUE_FIELD = "protected";
    public static final String TENANT_VARIABLE_GROUP_ID_FIELD = "tenant_variable_group_id";
    public static final String CREATED_AT_FIELD = "created_at";
    public static final String CREATED_BY_FIELD = "created_by";
    /** Pre-migration names, still read so a variable written before the cutover keeps its data. */
    public static final String LEGACY_PROTECTED_VALUE_FIELD = "protectedValue";
    public static final String LEGACY_GROUP_ID_FIELD = "static_tenant_variable_group_id";
    public static final String LEGACY_CREATED_AT_FIELD = "createdAt";
    public static final String LEGACY_CREATED_BY_FIELD = "createdBy";
    public static final String VALUES_FIELD = "values";
    public static final String TAG_IDS_FIELD = "tag_ids";

    public enum TenantVarType {
        TENANT_VARIABLE("TenantVariable"),
        STATIC_TENANT_VARIABLE("StaticTenantVariable");

        private final String type;

        TenantVarType(String type) {
            this.type = type;
        }

        public String getType() {
            return type;
        }
    }

    private ObjectId _id;
    private String _type;
    private boolean protectedValue;
    private String name;
    private ObjectId staticTenantVariableGroupId;
    private long createdAt;
    private String createdBy;

    private List<EnvironmentValue> values;

    private List<ObjectId> tagIds;

    public TenantVariable(){
        this._id = new ObjectId();
        this._type = TenantVarType.TENANT_VARIABLE.getType();
        this.protectedValue = false;
        this.values = new ArrayList<>();
        this.tagIds = new ArrayList<>();
    }

    public TenantVariable(String name){
        this._id = new ObjectId();
        this._type = TenantVarType.TENANT_VARIABLE.getType();
        this.protectedValue = false;
        this.name = name;
        this.values = new ArrayList<>();
        this.tagIds = new ArrayList<>();
    }

    public List<EnvironmentValue> getValues() {
        return values;
    }

    public Optional<EnvironmentValue> find(String environment) {
        return values.stream()
            .filter(v -> Optional.ofNullable(v.getEnvironment())
                .map(env -> env.equals(environment))
                .orElse(false))
            .findFirst();
    }

    public void put(EnvironmentValue environmentValue) {
        values.add(environmentValue);
    }

    @SuppressWarnings("unchecked")
    public static TenantVariable fromDocument(Document document) {

        TenantVariable tenantVariable = new TenantVariable();
        tenantVariable.set_id(document.getObjectId(ID_FIELD));
        if(document.getString(TYPE_FIELD) != null) {
            tenantVariable.set_type(document.getString(TYPE_FIELD));
        }
        Object protectedField = first(document, PROTECTED_VALUE_FIELD, LEGACY_PROTECTED_VALUE_FIELD);
        if(protectedField instanceof Boolean protectedValue) {
            tenantVariable.setProtectedValue(protectedValue);
        }
        tenantVariable.setName(document.getString(NAME_FIELD));
        if(first(document, TENANT_VARIABLE_GROUP_ID_FIELD, LEGACY_GROUP_ID_FIELD) instanceof ObjectId groupId) {
            tenantVariable.setStaticTenantVariableGroupId(groupId);
        }

        Object createdAtField = first(document, CREATED_AT_FIELD, LEGACY_CREATED_AT_FIELD);
        if (createdAtField != null) {
            if (createdAtField instanceof Long long1) {
                tenantVariable.setCreatedAt(long1);
            } else if (createdAtField instanceof Integer integer) {
                // Convert Integer to Long
                tenantVariable.setCreatedAt(integer.longValue());
            }
        }

        if(first(document, CREATED_BY_FIELD, LEGACY_CREATED_BY_FIELD) instanceof String createdBy) {
            tenantVariable.setCreatedBy(createdBy);
        }

        List<Document> valuesList = (List<Document>) document.get(VALUES_FIELD);
        for (Document valueDoc : valuesList == null ? List.<Document>of() : valuesList) {
            EnvironmentValue environmentValue = new EnvironmentValue();
            environmentValue.set_id(valueDoc.getObjectId(EnvironmentValue.ID_FIELD));
            environmentValue.setEnvironment(valueDoc.getString(EnvironmentValue.ENVIRONMENT_FIELD));
            environmentValue.setValue(valueDoc.getString(EnvironmentValue.VALUE_FIELD));
            environmentValue.setEncrypted(valueDoc.getBoolean(EnvironmentValue.ENCRYPTED_FIELD));
            Object lastUpdateObj = first(valueDoc, EnvironmentValue.UPDATED_AT_FIELD, EnvironmentValue.LEGACY_UPDATED_AT_FIELD);
            if (lastUpdateObj instanceof Number lastUpdate) {
                environmentValue.setLastUpdate(lastUpdate.longValue());
            }
            if (first(valueDoc, EnvironmentValue.UPDATED_BY_FIELD, EnvironmentValue.LEGACY_UPDATED_BY_FIELD) instanceof String updatedBy) {
                environmentValue.setUpdatedBy(updatedBy);
            }
            tenantVariable.put(environmentValue);
        }

        List<ObjectId> tagIds = document.getList(TAG_IDS_FIELD, ObjectId.class);
        tenantVariable.setTagIds(tagIds == null ? new ArrayList<>() : tagIds);

        return tenantVariable;
    }

    /** The value under {@code key}, or under {@code legacyKey} when only the pre-migration name is present. */
    private static Object first(Document document, String key, String legacyKey) {
        Object value = document.get(key);
        return value != null ? value : document.get(legacyKey);
    }

    public Document toDocument() {
        Document document = new Document();
        document.append(ID_FIELD, this.get_id());
        document.append(TYPE_FIELD, this.get_type());
        document.append(PROTECTED_VALUE_FIELD, this.isProtectedValue());
        document.append(NAME_FIELD, this.getName());
        if (this.getStaticTenantVariableGroupId() != null) {
            document.append(TENANT_VARIABLE_GROUP_ID_FIELD, this.getStaticTenantVariableGroupId());
        }
        document.append(CREATED_AT_FIELD, this.getCreatedAt());
        document.append(CREATED_BY_FIELD, this.getCreatedBy());
        document.append(VALUES_FIELD, this.valuesToDocuments());
        document.append(TAG_IDS_FIELD, this.getTagIds() == null ? new ArrayList<ObjectId>() : this.getTagIds());

        return document;
    }

    /** The environment values as stored; used whole on insert and as the {@code $set} of an update. */
    public List<Document> valuesToDocuments() {
        List<Document> valuesList = new ArrayList<>();
        for (EnvironmentValue environmentValue : this.getValues()) {
            Document valueDoc = new Document();
            valueDoc.append(EnvironmentValue.ID_FIELD, environmentValue.get_id());
            valueDoc.append(EnvironmentValue.ENVIRONMENT_FIELD, environmentValue.getEnvironment());
            valueDoc.append(EnvironmentValue.VALUE_FIELD, environmentValue.getValue());
            valueDoc.append(EnvironmentValue.ENCRYPTED_FIELD, environmentValue.isEncrypted());
            valueDoc.append(EnvironmentValue.UPDATED_AT_FIELD, environmentValue.getLastUpdate());
            valueDoc.append(EnvironmentValue.UPDATED_BY_FIELD, environmentValue.getUpdatedBy());
            valuesList.add(valueDoc);
        }
        return valuesList;
    }

    public ObjectId get_id() {
        return _id;
    }

    public void set_id(ObjectId _id) {
        this._id = _id;
    }

    public String get_type() {
        return _type;
    }

    public void set_type(String _type) {
        this._type = _type;
    }

    public ObjectId getStaticTenantVariableGroupId() {
        return staticTenantVariableGroupId;
    }

    public void setStaticTenantVariableGroupId(ObjectId staticTenantVariableGroupId) {
        this.staticTenantVariableGroupId = staticTenantVariableGroupId;
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

    public List<ObjectId> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<ObjectId> tagIds) {
        this.tagIds = tagIds;
    }

    public boolean isProtectedValue() {
        return protectedValue;
    }

    public void setProtectedValue(boolean protectedValue) {
        this.protectedValue = protectedValue;
    }
}
