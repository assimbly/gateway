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

    public static Role fromString(String value) {
        for (Role role : Role.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("No enum constant for value: " + value);
    }
}
