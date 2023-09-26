package org.assimbly.gateway.authenticate.domain;

public enum Role {
    SUPER_ADMIN("super_admin"),
    ADMIN("admin"),
    USER("user");

    private String value;

    Role(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }
}
