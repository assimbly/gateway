package org.assimbly.gateway;

import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.CommandsUtil;
import org.assimbly.gateway.config.DefaultProfileUtil;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.util.EncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.liquibase.autoconfigure.LiquibaseProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.env.Environment;
import tech.jhipster.config.JHipsterConstants;

import java.lang.management.ManagementFactory;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collection;

// @SpringBootApplication
@SpringBootApplication(scanBasePackages = { "org.assimbly.gateway", "org.assimbly.cookies", "org.assimbly.gateway.web.rest.integration", "org.assimbly.brokerrest", "org.assimbly.integrationrest" })
@EnableConfigurationProperties({ LiquibaseProperties.class, ApplicationProperties.class, EncryptionProperties.class })
public class GatewayApp {

    protected static Logger log = LoggerFactory.getLogger(GatewayApp.class);

    private static final String USER_HOME = System.getProperty("user.home");

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

            app.setBannerMode(Banner.Mode.OFF);
            app.setLogStartupInfo(false);

            DefaultProfileUtil.addDefaultProfile(app);
            Environment env = app
                .run(args).getEnvironment();

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
        String encryptionPassword = env.getProperty("encryption.jasypt.password");
        String encryptionAlgorithm = env.getProperty("encryption.jasypt.algorithm");

        if(encryptionPassword!=null && encryptionAlgorithm != null){
           new EncryptionUtil(encryptionPassword, encryptionAlgorithm);
        }

        if (StringUtils.isBlank(contextPath)) {
            contextPath = "/";
        }
        String hostAddress = "localhost";
        try {
            hostAddress = InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            log.warn("The host name could not be determined, using `localhost` as fallback");
        }

        long vmStartTime = ManagementFactory.getRuntimeMXBean().getStartTime();

        long startupTime = ((System.currentTimeMillis() - vmStartTime) / 1000);

        String applicationName = "Assimbly";
        String applicationVersion = env.getProperty("application.info.version");
        String applicationBaseDirectory = env.getProperty("application.gateway.base-directory");
        String applicationStartupTime = Long.toString(startupTime);
        String javaVersion = Runtime.version().toString();
        String javaWorkingDirectory = Path.of(".").toAbsolutePath().normalize().toString();

        if (applicationBaseDirectory == null || applicationBaseDirectory.equals("default")) {
            if (isWindows()) {
                applicationBaseDirectory = USER_HOME + "\\.assimbly";
            } else {
                applicationBaseDirectory = USER_HOME + "/.assimbly";
            }
        } else if(applicationBaseDirectory.endsWith("/")){
            applicationBaseDirectory = applicationBaseDirectory + ".assimbly";
        }

       log.info(
            """


            {} is running!

            ----------------------------------------------------------
            Version:         {}
            BaseDir:         {}
            Profile(s):      {}
            Java Version:    {}
            Java WorkingDir: {}
            Local URL:       {}://localhost:{}{}
            External URL:    {}://{}:{}{}
            Startup time:    {} seconds
            ----------------------------------------------------------

            """,
            applicationName,
            applicationVersion,
            applicationBaseDirectory,
            env.getActiveProfiles(),
            javaVersion,
            javaWorkingDirectory,
            protocol,
            serverPort,
            contextPath,
            protocol,
            hostAddress,
            serverPort,
            contextPath,
            applicationStartupTime
           );
    }

    public static boolean isWindows() {
        String operatingSystem = System.getProperty("os.name");
        return operatingSystem.startsWith("Windows");
    }
}
