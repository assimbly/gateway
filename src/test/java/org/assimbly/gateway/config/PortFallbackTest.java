package org.assimbly.gateway.config;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.OriginTrackedMapPropertySource;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.env.SimpleCommandLinePropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.Map;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;

/** A server.port from the configuration files that is in use moves to the next free port; one given on purpose stays. */
class PortFallbackTest {

    private static final DeferredLogFactory LOGS = Supplier::get;

    private ServerSocket taken;

    @BeforeEach
    void takeAPort() throws IOException {
        taken = new ServerSocket(0);
    }

    @AfterEach
    void releaseThePort() throws IOException {
        taken.close();
    }

    private static StandardEnvironment fromConfigurationFile(int port) {
        StandardEnvironment environment = new StandardEnvironment();
        environment.getPropertySources().addLast(
            new OriginTrackedMapPropertySource("Config resource 'application-dev.yml'", Map.of(PortFallback.SERVER_PORT, port)));
        return environment;
    }

    private static int portAfterStart(StandardEnvironment environment) {
        new PortFallback(LOGS).postProcessEnvironment(environment, new SpringApplication());
        return environment.getRequiredProperty(PortFallback.SERVER_PORT, Integer.class);
    }

    @Test
    void aTakenPortMovesToTheNextFreeOne() {
        int port = portAfterStart(fromConfigurationFile(taken.getLocalPort()));

        assertThat(port).isGreaterThan(taken.getLocalPort()).isLessThan(taken.getLocalPort() + PortFallback.ATTEMPTS);
    }

    @Test
    void aFreePortStays() throws IOException {
        int free = taken.getLocalPort();
        taken.close();

        assertThat(portAfterStart(fromConfigurationFile(free))).isEqualTo(free);
    }

    @Test
    void aPortGivenAsStartArgumentStaysEvenWhenTaken() {
        StandardEnvironment environment = fromConfigurationFile(8088);
        environment.getPropertySources().addFirst(new SimpleCommandLinePropertySource("--server.port=" + taken.getLocalPort()));

        assertThat(portAfterStart(environment)).isEqualTo(taken.getLocalPort());
    }

    @Test
    void aRandomPortStays() {
        assertThat(portAfterStart(fromConfigurationFile(0))).isZero();
    }
}
