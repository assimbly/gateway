package org.assimbly.gateway.jdbc.adapter;

import com.informix.jdbc.IfxDriver;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.assimbly.gateway.jdbc.domain.JDBCConnection;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;


public class InformixAdapter implements DatabaseAdapter {

    @Override
    public Connection connect(JDBCConnection connection) throws SQLException {
        List<NameValuePair> parameters = new ArrayList<>();
        IfxDriver driver = new IfxDriver();

        if(connection.isSecure()) {
            parameters.add(
                    new BasicNameValuePair("sslConnection", "true")
            );
        }

        String query = URLEncodedUtils.format(parameters, ';', StandardCharsets.UTF_8);

        String url = String.format("jdbc:informix-sqli://%s:%s/%s:%s",
                connection.getHost(), connection.getPort(), connection.getDatabase(), query);

        DriverManager.setLoginTimeout(5);
        DriverManager.registerDriver(driver);

        return DriverManager.getConnection(url, connection.getUsername(), connection.getPassword());
    }
}
