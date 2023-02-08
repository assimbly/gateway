package org.assimbly.gateway.authenticate.domain;

import org.bson.types.ObjectId;
import org.mongodb.morphia.annotations.Entity;
import org.mongodb.morphia.annotations.Id;
import org.mongodb.morphia.annotations.Property;

@Entity("tenants")
public class Tenant {

    @Id
    private ObjectId id;

    private String name;

    @Property("db_name")
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
}
