package org.assimbly.gateway.authenticate.domain;

public class TwoFactorRequest {

    private String email;
    private Integer token;

    public TwoFactorRequest() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getToken() {
        return token;
    }

    public void setToken(Integer token) {
        this.token = token;
    }
}
