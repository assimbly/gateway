package org.assimbly.gateway.jdbc.adapter;

import org.assimbly.gateway.jdbc.domain.JDBCConnection;

import java.sql.Connection;
import java.sql.SQLException;

public interface DatabaseAdapter {

    Connection connect(JDBCConnection connection) throws SQLException;
}
