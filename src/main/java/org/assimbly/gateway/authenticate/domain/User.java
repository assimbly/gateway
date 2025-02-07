package org.assimbly.gateway.authenticate.domain;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.bson.types.Symbol;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class User {

    public static final String ID_FIELD = "_id";
    public static final String EMAIL_FIELD = "email";
    public static final String ROLE_FIELD = "role";
    public static final String STATUS_FIELD = "status";
    public static final String PASSWORD_DIGEST_FIELD = "password_digest";
    public static final String TENANT_ID_FIELD = "tenant_id";
    public static final String USES_TWO_FACTOR_FIELD = "uses_two_factor";
    public static final String SECRET_KEY_FIELD = "secret_key";

    private ObjectId id;
    private String email;
    private Role role;
    private Status status;
    private String passwordDigest;
    private ObjectId tenantId;
    private Boolean usesTwoFactor;
    private String secretKey;

    protected static Logger log = LoggerFactory.getLogger(User.class);

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

    public Document toDocument() {
        Document document = new Document();
        if (id != null) {
            document.append(ID_FIELD, id);
        }
        document.append(EMAIL_FIELD, email)
            .append(ROLE_FIELD, role.toString())
            .append(STATUS_FIELD, status.toString()) // Converting Status enum to string
            .append(PASSWORD_DIGEST_FIELD, passwordDigest)
            .append(TENANT_ID_FIELD, tenantId)
            .append(USES_TWO_FACTOR_FIELD, usesTwoFactor)
            .append(SECRET_KEY_FIELD, secretKey);
        return document;
    }

    public static User fromDocument(Document document) {
        User user = new User();
        if (document.containsKey(ID_FIELD)) {
            user.setId(document.getObjectId(ID_FIELD));
        }
        user.setEmail(document.getString(EMAIL_FIELD));
        user.setRole(getEnumFromDocument(document, ROLE_FIELD, Role.class));
        user.setStatus(getEnumFromDocument(document, STATUS_FIELD, Status.class));
        user.setPasswordDigest(document.getString(PASSWORD_DIGEST_FIELD));
        user.setTenantId(document.getObjectId(TENANT_ID_FIELD));
        user.setUsesTwoFactor(document.getBoolean(USES_TWO_FACTOR_FIELD));
        user.setSecretKey(document.getString(SECRET_KEY_FIELD));
        return user;
    }

    private static <T extends Enum<T>> T getEnumFromDocument(Document document, String fieldName, Class<T> enumClass) {
        try {
            Object fieldObj = document.get(fieldName);
            if (fieldObj instanceof Symbol) {
                String symbolValue = ((Symbol) fieldObj).getSymbol();
                return Enum.valueOf(enumClass, symbolValue.toUpperCase());
            } else if (fieldObj instanceof String) {
                String stringValue = (String) fieldObj;
                return Enum.valueOf(enumClass, stringValue.toUpperCase());
            } else {
                throw new IllegalArgumentException("Unsupported type for field: " + fieldName + ", class: " + fieldObj.getClass().getName());
            }
        } catch (ClassCastException e) {
            log.error("Failed to get enum from document for field: {}, document: {}", fieldName, document.toJson(), e);
            throw e;
        }
    }

}
