package org.assimbly.gateway.authenticate.domain;

import org.bson.types.ObjectId;
import org.mongodb.morphia.annotations.*;
import org.assimbly.gateway.authenticate.util.EnumConverter;

@Entity("users")
@Converters(EnumConverter.class)
public class User {

    @Id
    private ObjectId id;

    private String email;
    private Role role;
    private Status status;

    @Property("password_digest")
    private String passwordDigest;

    @Property("tenant_id")
    private ObjectId tenantId;

    @Property("uses_two_factor")
    private Boolean usesTwoFactor;

    @Property("secret_key")
    private String secretKey;

    public User() {
        this.id = new ObjectId();
    }

    public User(String email, String passwordDigest, Role role, Status status, ObjectId tenantId) {
        this();
        this.email = email;
        this.passwordDigest = passwordDigest;
        this.role = role;
        this.status = status;
        this.tenantId = tenantId;
    }

    //<editor-fold desc="Getters/Setters">

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getPasswordDigest() {
        return passwordDigest;
    }

    public void setPasswordDigest(String passwordDigest) {
        this.passwordDigest = passwordDigest;
    }

    public ObjectId getTenantId() {
        return tenantId;
    }

    public void setTenantId(ObjectId tenantId) {
        this.tenantId = tenantId;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public void setUsesTwoFactor(Boolean usesTwoFactor) {
        this.usesTwoFactor = usesTwoFactor;
    }

    public Boolean getUsesTwoFactor() {
        return usesTwoFactor;
    }

    //</editor-fold>

    //<editor-fold desc="HashCode/Equals">
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        User user = (User) o;

        if (email != null ? !email.equals(user.email) : user.email != null) return false;
        if (passwordDigest != null ? !passwordDigest.equals(user.passwordDigest) : user.passwordDigest != null)
            return false;
        return role == user.role;
    }

    @Override
    public int hashCode() {
        int result = email != null ? email.hashCode() : 0;
        result = 31 * result + (passwordDigest != null ? passwordDigest.hashCode() : 0);
        result = 31 * result + (role != null ? role.hashCode() : 0);
        return result;
    }
    //</editor-fold>
}
