package org.assimbly.gateway.jdbc.adapter;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.assimbly.gateway.jdbc.domain.JDBCConnection;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class MysqlAdapter implements DatabaseAdapter {

    @Override
    public Connection connect(JDBCConnection connection) throws SQLException {
        com.mysql.cj.jdbc.Driver driver = new com.mysql.cj.jdbc.Driver();

        List<NameValuePair> parameters = new ArrayList<>(
                putParameters(
                    new BasicNameValuePair("useLegacyDatetimeCode", "false"),
                    new BasicNameValuePair("serverTimezone", "UTC")
                )
        );

        if(connection.isSecure()) {
            parameters.addAll(
                putParameters(
                    new BasicNameValuePair("verifyServerCertificate", "true"),
                    new BasicNameValuePair("useSSL", "true"),
                    new BasicNameValuePair("requireSSL", "true")
                )
            );

            if(!connection.getEnabledTLSProtocols().isEmpty())
                parameters.add(new BasicNameValuePair("enabledTLSProtocols", connection.getEnabledTLSProtocols()));

        }else{
            parameters.add(new BasicNameValuePair("useSSL", "false"));

            if(this instanceof Mysql8Adapter)
                parameters.add(new BasicNameValuePair("allowPublicKeyRetrieval", "true"));
        }

        String query = URLEncodedUtils.format(parameters, StandardCharsets.UTF_8);

        String url = String.format("jdbc:mysql://%s:%s/%s?%s",
                connection.getHost(), connection.getPort(), connection.getDatabase(), query);

        DriverManager.setLoginTimeout(5);
        DriverManager.registerDriver(driver);

        return DriverManager.getConnection(url, connection.getUsername(), connection.getPassword());
    }

    private List<NameValuePair> putParameters(NameValuePair ... pairs) {
        return Arrays.stream(pairs)
                .collect(Collectors.toList());
    }
}
