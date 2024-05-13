package org.assimbly.gateway.authenticate.domain;

import org.bson.Document;
import org.bson.types.ObjectId;

public class Tenant {

    public static final String ID_FIELD = "_id";
    public static final String NAME_FIELD = "name";
    public static final String DB_NAME_FIELD = "db_name";
    public static final String DISABLED_FIELD = "disabled";

    private ObjectId id;
    private String name;
    private String dbName;
    private boolean disabled;

    public Tenant() {
        this.id = new ObjectId();
    }

    public Tenant(String name, String dbName, boolean disabled) {
        this();
        this.name = name;
        this.dbName = dbName;
        this.disabled = disabled;
    }

    //<editor-fold desc="Getters/Setters">

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDbName() {
        return dbName;
    }

    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    public boolean getDisabled() {
        return disabled;
    }

    public void setDisabled(boolean disabled) {
        this.disabled = disabled;
    }

    //</editor-fold>

    //<editor-fold desc="HashCode/Equals">

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Tenant tenant = (Tenant) o;

        if (disabled != tenant.disabled) return false;
        if (id != null ? !id.equals(tenant.id) : tenant.id != null) return false;
        if (name != null ? !name.equals(tenant.name) : tenant.name != null) return false;
        return dbName != null ? dbName.equals(tenant.dbName) : tenant.dbName == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (dbName != null ? dbName.hashCode() : 0);
        result = 31 * result + (disabled ? 1 : 0);
        return result;
    }

    //</editor-fold>

    public Document toDocument() {
        Document document = new Document();
        if (id != null) {
            document.append(ID_FIELD, id);
        }
        document.append(NAME_FIELD, name)
            .append(DB_NAME_FIELD, dbName)
            .append(DISABLED_FIELD, disabled);
        return document;
    }

    public static Tenant fromDocument(Document document) {
        Tenant tenant = new Tenant();
        if (document.containsKey(ID_FIELD)) {
            tenant.setId(document.getObjectId(ID_FIELD));
        }
        tenant.setName(document.getString(NAME_FIELD));
        tenant.setDbName(document.getString(DB_NAME_FIELD));
        tenant.setDisabled(document.getBoolean(DISABLED_FIELD).booleanValue());
        return tenant;
    }
}
