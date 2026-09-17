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
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * H2 stores DB_CLOSE_DELAY in the database file. Databases created with DB_CLOSE_DELAY=-1
 * keep that setting even after it is removed from the JDBC URL, which can drop recent
 * commits (new flows/steps) on JVM stop while older rows survive.
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
            String closeDelay = readSetting(s, "DB_CLOSE_DELAY");
            String writeDelay = readSetting(s, "WRITE_DELAY");
            log.info("H2 durability settings applied: DB_CLOSE_DELAY={}, WRITE_DELAY={}", closeDelay, writeDelay);
        } catch (Exception e) {
            log.warn("Could not apply H2 durability settings: {}", e.toString());
        }
    }

    private static String readSetting(Statement s, String name) {
        try (ResultSet rs = s.executeQuery(
            "SELECT SETTING_VALUE FROM INFORMATION_SCHEMA.SETTINGS WHERE SETTING_NAME='" + name + "'"
        )) {
            if (rs.next()) {
                return rs.getString(1);
            }
        } catch (Exception ignored) {
            // older H2 column names
        }
        try (ResultSet rs = s.executeQuery("SELECT * FROM INFORMATION_SCHEMA.SETTINGS")) {
            while (rs.next()) {
                String n;
                try {
                    n = rs.getString("SETTING_NAME");
                } catch (Exception e) {
                    n = rs.getString("NAME");
                }
                if (name.equalsIgnoreCase(n)) {
                    try {
                        return rs.getString("SETTING_VALUE");
                    } catch (Exception e) {
                        return rs.getString("VALUE");
                    }
                }
            }
        } catch (Exception e) {
            return "error";
        }
        return "unknown";
    }
}
