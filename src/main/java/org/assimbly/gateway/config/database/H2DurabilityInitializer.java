package org.assimbly.gateway.config.database;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * H2 stores DB_CLOSE_DELAY in the database file. Databases created with DB_CLOSE_DELAY=-1
 * keep that setting even after it is removed from the JDBC URL, which can drop recent
 * commits (broker type, new flows/steps) on JVM stop while older rows survive.
 * WRITE_DELAY=0 is also applied on every connection; H2CommitSync fsyncs after each write.
 */
@Component
@Order(0)
public class H2DurabilityInitializer implements ApplicationRunner {

    private final Logger log = LoggerFactory.getLogger(H2DurabilityInitializer.class);

    private final DataSource dataSource;
    private final Environment env;

    public H2DurabilityInitializer(DataSource dataSource, Environment env) {
        this.dataSource = dataSource;
        this.env = env;
    }

    @Override
    public void run(ApplicationArguments args) {
        String jdbcUrl = env.getProperty("spring.datasource.url", "");
        if (!jdbcUrl.contains("jdbc:h2:")) {
            return;
        }
        try (Connection c = dataSource.getConnection(); Statement s = c.createStatement()) {
            s.execute("SET DB_CLOSE_DELAY 0");
            s.execute("SET WRITE_DELAY 0");
            s.execute("CHECKPOINT SYNC");
            String closeDelay = readSetting(c, "DB_CLOSE_DELAY");
            String writeDelay = readSetting(c, "WRITE_DELAY");
            log.info("H2 durability settings applied: DB_CLOSE_DELAY={}, WRITE_DELAY={}", closeDelay, writeDelay);
        } catch (Exception e) {
            log.warn("Could not apply H2 durability settings: {}", e.toString());
        }
    }

    private String readSetting(Connection c, String name) {
        try (PreparedStatement ps = c.prepareStatement(
            "SELECT SETTING_VALUE FROM INFORMATION_SCHEMA.SETTINGS WHERE SETTING_NAME = ?"
        )) {
            ps.setString(1, name);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getString(1) : "unknown";
            }
        } catch (SQLException e) {
            log.warn("Could not read H2 setting {}: {}", name, e.toString());
            return "error";
        }
    }
}
