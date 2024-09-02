package org.assimbly.gateway.authenticate.domain;

public enum Status {
    PENDING("pending"),
    ACTIVE ("active"),
    BLOCKED("blocked");

    private String value;

    Status(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static Status fromString(String value) {
        for (Status status : Status.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("No enum constant for value: " + value);
    }
}
