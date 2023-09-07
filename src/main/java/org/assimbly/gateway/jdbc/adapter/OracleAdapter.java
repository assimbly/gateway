package org.assimbly.gateway.jdbc.adapter;

import oracle.jdbc.OracleDriver;
import org.assimbly.gateway.jdbc.domain.JDBCConnection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class OracleAdapter implements DatabaseAdapter {

    @Override
    public Connection connect(JDBCConnection connection) throws SQLException {
        OracleDriver driver = new OracleDriver();

        String url = String.format("jdbc:oracle:thin:@%s:%s/%s",
                connection.getHost(), connection.getPort(), connection.getDatabase());

        //TODO: Figure out how SSL is configured in Oracle JDBC Connection String

        DriverManager.setLoginTimeout(5);
        DriverManager.registerDriver(driver);

        return DriverManager.getConnection(url, connection.getUsername(), connection.getPassword());
    }
}
