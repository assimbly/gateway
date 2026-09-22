package org.assimbly.gateway.config.database;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Persist H2 MVStore to disk after a commit. CHECKPOINT must run on the
 * connection that performed the write, then that connection must be closed
 * (Hikari eviction). A CHECKPOINT on a different pool connection does not
 * include another session's committed pages.
 */
@Component
public class H2CommitSync {

    private final Logger log = LoggerFactory.getLogger(H2CommitSync.class);

    private final DataSource dataSource;
    private final boolean h2;

    public H2CommitSync(DataSource dataSource, Environment env) {
        this.dataSource = dataSource;
        this.h2 = env.getProperty("spring.datasource.url", "").contains("jdbc:h2:");
    }

    public void checkpointOnCurrentConnection() {
        if (!h2) {
            return;
        }
        Connection connection = DataSourceUtils.getConnection(dataSource);
        try {
            try (Statement statement = connection.createStatement()) {
                statement.execute("SET WRITE_DELAY 0");
                statement.execute("CHECKPOINT SYNC");
            }
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
        } catch (Exception e) {
            log.warn("H2 CHECKPOINT SYNC failed: {}", e.toString());
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    public void evictPoolAndForceFile() {
        if (!h2) {
            return;
        }
        try {
            HikariDataSource hikari = dataSource.unwrap(HikariDataSource.class);
            hikari.getHikariPoolMXBean().softEvictConnections();
        } catch (Exception e) {
            log.warn("H2 pool eviction failed: {}", e.toString());
        }
        try {
            Path mv = Path.of(System.getProperty("user.home"), ".assimbly", "db", "gateway.mv.db");
            try (FileChannel channel = FileChannel.open(mv, StandardOpenOption.READ, StandardOpenOption.WRITE)) {
                channel.force(true);
            }
        } catch (Exception e) {
            log.debug("Could not fsync H2 file: {}", e.toString());
        }
    }
}
