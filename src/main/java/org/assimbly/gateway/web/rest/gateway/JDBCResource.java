package org.assimbly.gateway.web.rest.gateway;

import org.assimbly.gateway.jdbc.adapter.DatabaseAdapter;
import org.assimbly.gateway.jdbc.domain.ConnectionType;
import org.assimbly.gateway.jdbc.domain.JDBCConnection;
import org.assimbly.util.error.ValidationErrorMessage;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * REST controller for testing jdbc connections
 */
@RestController
@RequestMapping("/api")
public class JDBCResource {

    /**
     * GET  /validation/jdbc : test jdbc
     */
    @GetMapping(
        path = "/validation/jdbc",
        produces = {MediaType.APPLICATION_JSON_VALUE}
    )
    public ValidationErrorMessage validateJdbc(
        @RequestParam("type") String type,
        @RequestParam("user") String userName,
        @RequestParam("host") String host,
        @RequestParam("instance") String instance,
        @RequestParam("pwd") String password,
        @RequestParam("port") int port,
        @RequestParam("useSSL") boolean useSSL,
        @RequestParam("enabledTLSProtocols") String enabledTLSProtocols,
        @RequestParam("escapeChars") boolean escapeChars,
        @RequestParam("database") String database
    ) {
        Connection connection = null;

        try {
            ConnectionType connectionType = ConnectionType.valueOf(type.toUpperCase());

            JDBCConnection jdbcConnection = JDBCConnection.builder()
                .setUsername(userName)
                .setPassword(password)
                .setHost(host)
                .setInstance(instance)
                .setPort(port)
                .setSecure(useSSL)
                .setEnabledTLSProtocols(enabledTLSProtocols)
                .setEscapeChars(escapeChars)
                .setDatabase(database)
                .build();

            DatabaseAdapter adapter = connectionType.getAdapter();

            connection = jdbcConnection.connect(adapter);
        } catch (SQLException | ClassNotFoundException | InstantiationException | IllegalAccessException e) {
            return new ValidationErrorMessage(e.getMessage());
        } finally {
            close(connection);
        }

        return null;
    }

    private void close(Connection connection) {
        if(connection == null) {
            return;
        }

        try {
            connection.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

}
