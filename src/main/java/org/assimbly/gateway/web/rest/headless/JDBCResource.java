package org.assimbly.gateway.web.rest.headless;

import org.assimbly.gateway.jdbc.adapter.DatabaseAdapter;
import org.assimbly.gateway.jdbc.domain.ConnectionType;
import org.assimbly.gateway.jdbc.domain.JDBCConnection;
import org.assimbly.util.error.ValidationErrorMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.InvocationTargetException;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * REST controller for testing jdbc connections
 */
@RestController
@RequestMapping("/api")
public class JDBCResource {

    private final Logger log = LoggerFactory.getLogger(JDBCResource.class);

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
                .setDatabase(database)
                .build();

            DatabaseAdapter adapter = connectionType.getAdapter();

            connection = jdbcConnection.connect(adapter);
        } catch (SQLException | ClassNotFoundException | InstantiationException | IllegalAccessException | NoSuchMethodException |
                 InvocationTargetException e) {
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
            log.warn("Failed to close database connection", e);
        }
    }

}
