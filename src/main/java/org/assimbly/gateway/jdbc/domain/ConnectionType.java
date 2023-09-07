package org.assimbly.gateway.jdbc.domain;

import org.assimbly.gateway.jdbc.adapter.DatabaseAdapter;

public enum ConnectionType {
    DB2("DB2Adapter"),
    INFORMIX("InformixAdapter"),
    MYSQL("MysqlAdapter"),
    MYSQL8("Mysql8Adapter"),
    SQL_SERVER("SqlServerAdapter"),
    ORACLE("OracleAdapter"),
    POSTGRES("PostgresAdapter");

    String adapterName;

    ConnectionType(String adapterName) {
        this.adapterName = adapterName;
    }

    public DatabaseAdapter getAdapter() throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        return (DatabaseAdapter) Class.forName("org.assimbly.gateway.jdbc.adapter." + adapterName).newInstance();
    }
}
