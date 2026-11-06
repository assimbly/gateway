package org.assimbly.gateway.config;

import org.apache.commons.logging.Log;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.boot.context.properties.source.ConfigurationPropertySources;
import org.springframework.boot.env.OriginTrackedMapPropertySource;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.util.Map;

/**
 * When the {@code server.port} from the configuration files is already in use, moves the Gateway to the next free port
 * (8080, 8081, ...), so a second Gateway on the same machine still starts.
 * <p>
 * Only a port from the configuration files moves. A port given on purpose, as a start argument, an environment variable
 * or a system property, stays, so a clash there still stops the start; Docker maps the port it sets that way.
 * <p>
 * Runs right after the configuration files are read, so the startup log, the H2 port and the REST resources that read
 * {@code server.port} all see the port the Gateway really uses.
 */
public class PortFallback implements EnvironmentPostProcessor, Ordered {

    static final String SERVER_PORT = "server.port";

    static final int ATTEMPTS = 10;

    private final Log log;

    public PortFallback(DeferredLogFactory logFactory) {
        this.log = logFactory.getLog(PortFallback.class);
    }

    @Override
    public int getOrder() {
        return ConfigDataEnvironmentPostProcessor.ORDER + 1;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Integer port = environment.getProperty(SERVER_PORT, Integer.class);
        if (port == null || port <= 0 || !fromConfigurationFile(environment)) {
            return;
        }

        String host = environment.getProperty("server.address");
        int last = Math.min(port + ATTEMPTS - 1, 65535);
        for (int candidate = port; candidate <= last; candidate++) {
            InetSocketAddress address = host == null ? new InetSocketAddress(candidate) : new InetSocketAddress(host, candidate);
            if (address.isUnresolved()) {
                return;
            }
            if (isFree(address)) {
                if (candidate != port) {
                    environment.getPropertySources().addFirst(new MapPropertySource("portFallback", Map.of(SERVER_PORT, candidate)));
                    ConfigurationPropertySources.attach(environment);
                    log.warn("Port " + port + " is already in use, using port " + candidate + " instead");
                }
                return;
            }
        }
        log.warn("Ports " + port + " to " + last + " are all in use; set " + SERVER_PORT + " to a free port");
    }

    private static boolean fromConfigurationFile(ConfigurableEnvironment environment) {
        for (PropertySource<?> source : environment.getPropertySources()) {
            if (!ConfigurationPropertySources.isAttachedConfigurationPropertySource(source) && source.containsProperty(SERVER_PORT)) {
                return source instanceof OriginTrackedMapPropertySource;
            }
        }
        return false;
    }

    static boolean isFree(InetSocketAddress address) {
        try (ServerSocket socket = new ServerSocket()) {
            socket.bind(address);
            return true;
        } catch (IOException _) {
            // The bind failing is the answer: something else listens on this port.
            return false;
        }
    }
}
