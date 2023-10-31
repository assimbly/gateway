package org.assimbly.gateway;

import java.lang.management.ManagementFactory;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collection;
import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.CommandsUtil;
import org.assimbly.gateway.config.DefaultProfileUtil;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.util.EncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.metrics.mongo.MongoMetricsAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.groovy.template.GroovyTemplateAutoConfiguration;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.env.Environment;
import tech.jhipster.config.JHipsterConstants;

// @SpringBootApplication
@SpringBootApplication(scanBasePackages = { "org.assimbly.gateway", "org.assimbly.cookies", "org.assimbly.gateway.web.rest.integration", "org.assimbly.brokerrest", "org.assimbly.integrationrest", "org.assimbly.integrationrestdt" }, exclude = { MongoAutoConfiguration.class, MongoDataAutoConfiguration.class, MongoMetricsAutoConfiguration.class, GroovyTemplateAutoConfiguration.class})
@EnableConfigurationProperties({ LiquibaseProperties.class, ApplicationProperties.class, EncryptionProperties.class })
public class GatewayApp {

    protected static Logger log = LoggerFactory.getLogger(GatewayApp.class);

    private static final String userHomeDir = System.getProperty("user.home");

    private static long vmStartTime;

    private final Environment env;

    public GatewayApp(Environment env) {
        this.env = env;
    }

    /**
     * Initializes gateway.
     * <p>
     * Spring profiles can be configured with a program argument --spring.profiles.active=your-active-profile
     * <p>
     * You can find more information on how profiles work with JHipster on <a href="https://www.jhipster.tech/profiles/">https://www.jhipster.tech/profiles/</a>.
     */
    @PostConstruct
    public void initApplication() {
        Collection<String> activeProfiles = Arrays.asList(env.getActiveProfiles());
        if (
            activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT) &&
            activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_PRODUCTION)
        ) {
            log.error(
                "You have misconfigured your application! It should not run " + "with both the 'dev' and 'prod' profiles at the same time."
            );
        }
        if (
            activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT) &&
            activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_CLOUD)
        ) {
            log.error(
                "You have misconfigured your application! It should not " + "run with both the 'dev' and 'cloud' profiles at the same time."
            );
        }
    }

    /**
     * Main method, used to run the application.
     *
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        boolean startApplication = CommandsUtil.parseParameters(args);

        if (startApplication) {
            SpringApplication app = new SpringApplication(GatewayApp.class);
            //app.setApplicationStartup(new BufferingApplicationStartup(2048));

            DefaultProfileUtil.addDefaultProfile(app);
            Environment env = app.run(args).getEnvironment();

            logApplicationStartup(env);
        }
    }

    private static void logApplicationStartup(Environment env) {

        String protocol = "http";
        if (env.getProperty("server.ssl.key-store") != null) {
            protocol = "https";
        }

        String serverPort = env.getProperty("server.port");
        String contextPath = env.getProperty("server.servlet.context-path");
        EncryptionUtil.key = env.getProperty("encryption.jasypt.password");
        EncryptionUtil.algorithm = env.getProperty("encryption.jasypt.algorithm");

        if (StringUtils.isBlank(contextPath)) {
            contextPath = "/";
        }
        String hostAddress = "localhost";
        try {
            hostAddress = InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            log.warn("The host name could not be determined, using `localhost` as fallback");
        }

        vmStartTime = ManagementFactory.getRuntimeMXBean().getStartTime();

        long startupTime = ((System.currentTimeMillis() - vmStartTime) / 1000);

        String applicationName = "Assimbly";
        String applicationVersion = env.getProperty("application.info.version");
        String applicationBaseDirectory = env.getProperty("application.gateway.base-directory");
        String applicationStartupTime = Long.toString(startupTime);
        String javaVersion = Runtime.version().toString();
        String javaWorkingDirectory = Paths.get(".").toAbsolutePath().normalize().toString();

        if (applicationBaseDirectory.equals("default")) {
            if (isWindows()) {
                applicationBaseDirectory = userHomeDir + "\\.assimbly";
            } else {
                applicationBaseDirectory = userHomeDir + "/.assimbly";
            }
        } else {
            applicationBaseDirectory = applicationBaseDirectory + "/.assimbly";
        }

       log.info(
            "\n----------------------------------------------------------\n\t" +
            "{} is running! \n\n\t" +
            "Application Version: \t{}\n\t" +
            "Application BaseDir: \t{}\n\t" +
            "Application Startup: \t{} Seconds\n\t" +
            "Local URL: \t\t{}://localhost:{}{}\n\t" +
            "External URL: \t\t{}://{}:{}{}\n\t" +
            "Java Version: \t\t{}\n\t" +
            "Java WorkingDir: \t{}\n\t" +
            "Profile(s): \t\t{}\n----------------------------------------------------------",
            applicationName,
            applicationVersion,
            applicationBaseDirectory,
            applicationStartupTime,
            protocol,
            serverPort,
            contextPath,
            protocol,
            hostAddress,
            serverPort,
            contextPath,
            javaVersion,
            javaWorkingDirectory,
            env.getActiveProfiles()
        );
    }

    public static boolean isWindows() {
        String OS = System.getProperty("os.name");
        return OS.startsWith("Windows");
    }
}
