package org.assimbly.gateway.jdbc.domain;

import org.assimbly.gateway.jdbc.adapter.DatabaseAdapter;

import java.sql.Connection;
import java.sql.SQLException;

public class JDBCConnection {

    private String username;
    private String password;
    private String host;
    private String instance;
    private int port;
    private String database;
    private boolean isSecure;
    private String enabledTLSProtocols;
    private boolean escapeChars;

    private JDBCConnection(Builder builder) {
        this.username = builder.username;
        this.password = builder.password;
        this.host = builder.host;
        this.instance = builder.instance;
        this.port = builder.port;
        this.database = builder.database;
        this.isSecure = builder.isSecure;
        this.enabledTLSProtocols = builder.enabledTLSProtocols;
        this.escapeChars = builder.escapeChars;
    }

    public Connection connect(DatabaseAdapter adapter) throws SQLException {
        return adapter.connect(this);
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getHost() {
        return host;
    }

    public String getInstance() {
        return instance;
    }

    public int getPort() {
        return port;
    }

    public String getDatabase() {
        return database;
    }

    public boolean isSecure() {
        return isSecure;
    }

    public String getEnabledTLSProtocols() { return enabledTLSProtocols; }

    public boolean getEscapeChars() { return escapeChars; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private String username;
        private String password;
        private String host;
        private String instance;
        private int port;
        private String database;
        private boolean isSecure;
        private String enabledTLSProtocols;
        private boolean escapeChars;

        public JDBCConnection build() {
            return new JDBCConnection(this);
        }

        public Builder setUsername(String username) {
            this.username = username;
            return this;
        }

        public Builder setPassword(String password) {
            this.password = password;
            return this;
        }

        public Builder setHost(String host) {
            this.host = host;
            return this;
        }

        public Builder setInstance(String instance) {
            this.instance = instance;
            return this;
        }

        public Builder setPort(int port) {
            this.port = port;
            return this;
        }

        public Builder setDatabase(String database) {
            this.database = database;
            return this;
        }

        public Builder setSecure(boolean secure) {
            isSecure = secure;
            return this;
        }

        public Builder setEnabledTLSProtocols(String enabledTLSProtocols) {
            this.enabledTLSProtocols = enabledTLSProtocols;
            return this;
        }

        public Builder setEscapeChars(boolean escapeChars) {
            this.escapeChars = escapeChars;
            return this;
        }
    }
}
