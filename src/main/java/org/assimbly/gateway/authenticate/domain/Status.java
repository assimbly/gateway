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
}
