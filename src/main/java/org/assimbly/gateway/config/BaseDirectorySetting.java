package org.assimbly.gateway.config;

import org.apache.commons.logging.Log;
import org.assimbly.util.BaseDirectory;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

import java.nio.file.Path;

/**
 * Applies {@code application.gateway.base-directory} from the configuration (application.yml, the environment variable
 * APPLICATION_GATEWAY_BASE_DIRECTORY, a system property) the same way as the {@code -d=} start argument: it names the
 * folder that holds {@code .assimbly} with the database, security, broker and logs. {@code default} leaves the user's
 * home folder.
 * <p>
 * Runs right after the configuration files are read, before the logging, the secrets and the runtime use the folder.
 */
public class BaseDirectorySetting implements EnvironmentPostProcessor, Ordered {

    public static final String BASE_DIRECTORY = "application.gateway.base-directory";

    public static final int ORDER = ConfigDataEnvironmentPostProcessor.ORDER + 1;

    private final Log log;

    public BaseDirectorySetting(DeferredLogFactory logFactory) {
        this.log = logFactory.getLog(BaseDirectorySetting.class);
    }

    @Override
    public int getOrder() {
        return ORDER;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String value = environment.getProperty(BASE_DIRECTORY);
        if (value == null || value.isBlank() || value.equalsIgnoreCase("default")) {
            return;
        }

        String folder = Path.of(value.trim()).toAbsolutePath().normalize().toString();
        if (!folder.equals(System.getProperty("user.home"))) {
            System.setProperty("user.home", folder);
            log.info("Using base directory " + folder + " (" + BASE_DIRECTORY + ")");
        }
        BaseDirectory.getInstance().setBaseDirectory(Path.of(folder, ".assimbly").toString());
    }
}
