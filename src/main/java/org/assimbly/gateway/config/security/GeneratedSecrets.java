package org.assimbly.gateway.config.security;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFileAttributeView;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Properties;
import org.apache.commons.logging.Log;
import org.assimbly.gateway.config.BaseDirectorySetting;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertiesPropertySource;

/**
 * Gives every Gateway its own secrets: the key that signs login tokens and the key that encrypts Connection keys and
 * Variables. A secret the configuration sets always wins. Otherwise the token key is ASSIMBLY_JWT_SECRET and the
 * encryption key ASSIMBLY_ENCRYPTION_SECRET when they are set (so a server can give its Gateways the same keys), and
 * anything still missing is generated once and kept in {@code .assimbly/security/secrets.properties}.
 */
public class GeneratedSecrets implements EnvironmentPostProcessor, Ordered {

    public static final String JWT_SECRET = "jhipster.security.authentication.jwt.base64-secret";
    public static final String ENCRYPTION_SECRET = "encryption.jasypt.password";
    public static final String RUNTIME_JWT_SECRET = "ASSIMBLY_JWT_SECRET";
    public static final String RUNTIME_ENCRYPTION_SECRET = "ASSIMBLY_ENCRYPTION_SECRET";

    static final String PROPERTY_SOURCE_NAME = "generatedSecrets";

    /** What HS512, the signature of login tokens, needs. */
    static final int MIN_JWT_SECRET_BITS = 512;

    private static final SecureRandom RANDOM = new SecureRandom();

    private final Log log;

    public GeneratedSecrets(DeferredLogFactory logFactory) {
        this.log = logFactory.getLog(GeneratedSecrets.class);
    }

    @Override
    public int getOrder() {
        // After the configuration files are read, so their secrets are known, and after the base directory is set
        return BaseDirectorySetting.ORDER + 1;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        addMissingSecrets(environment);
        checkJwtSecret(environment.getProperty(JWT_SECRET));
    }

    private void addMissingSecrets(ConfigurableEnvironment environment) {
        boolean needsJwtSecret = isBlank(environment.getProperty(JWT_SECRET));
        boolean needsEncryptionSecret = isBlank(environment.getProperty(ENCRYPTION_SECRET));
        if (!needsJwtSecret && !needsEncryptionSecret) {
            return;
        }

        Properties secrets = new Properties();
        String runtimeJwtSecret = environment.getProperty(RUNTIME_JWT_SECRET);
        if (needsJwtSecret && !isBlank(runtimeJwtSecret)) {
            secrets.setProperty(JWT_SECRET, runtimeJwtSecret);
            needsJwtSecret = false;
        }
        String runtimeSecret = environment.getProperty(RUNTIME_ENCRYPTION_SECRET);
        if (needsEncryptionSecret && !isBlank(runtimeSecret)) {
            secrets.setProperty(ENCRYPTION_SECRET, runtimeSecret);
            needsEncryptionSecret = false;
        }

        if (needsJwtSecret || needsEncryptionSecret) {
            Properties stored;
            try {
                stored = storedSecrets();
            } catch (UncheckedIOException e) {
                String variables = needsJwtSecret && needsEncryptionSecret
                    ? RUNTIME_JWT_SECRET + " and " + RUNTIME_ENCRYPTION_SECRET
                    : needsJwtSecret ? RUNTIME_JWT_SECRET : RUNTIME_ENCRYPTION_SECRET;
                throw new IllegalStateException(
                    "Could not store the Gateway's secrets in " + secretsFile() + ". Make that folder writable, or set " + variables + ".",
                    e
                );
            }
            if (needsJwtSecret) {
                secrets.setProperty(JWT_SECRET, stored.getProperty(JWT_SECRET));
            }
            if (needsEncryptionSecret) {
                secrets.setProperty(ENCRYPTION_SECRET, stored.getProperty(ENCRYPTION_SECRET));
            }
        }

        // Last, so environment variables and an application.yml next to the jar still win
        environment.getPropertySources().addLast(new PropertiesPropertySource(PROPERTY_SOURCE_NAME, secrets));
    }

    /**
     * Fails the start when the token key is too short for HS512, which would otherwise only show at the first login.
     */
    static void checkJwtSecret(String key) {
        if (isBlank(key)) {
            return;
        }
        int bits = com.nimbusds.jose.util.Base64.from(key.trim()).decode().length * 8;
        if (bits < MIN_JWT_SECRET_BITS) {
            throw new IllegalStateException(
                "The key that signs login tokens (" + RUNTIME_JWT_SECRET + " or " + JWT_SECRET + ") is " + bits +
                    " bits; it needs at least " + MIN_JWT_SECRET_BITS + ". Make one with: openssl rand -base64 64"
            );
        }
    }

    /** The secrets kept in the secrets file. A missing one is generated and stored there, once. */
    private Properties storedSecrets() {
        Path file = secretsFile();
        Properties stored = read(file);
        boolean generated = false;
        if (!stored.containsKey(JWT_SECRET)) {
            stored.setProperty(JWT_SECRET, randomBase64(64));
            generated = true;
        }
        if (!stored.containsKey(ENCRYPTION_SECRET)) {
            stored.setProperty(ENCRYPTION_SECRET, randomBase64(32));
            generated = true;
        }
        if (generated) {
            write(file, stored);
            log.info("Generated the Gateway's secrets in " + file);
        }
        return stored;
    }

    /** Where the generated secrets are kept: next to the database, in the Gateway's base directory. */
    public static Path secretsFile() {
        return Path.of(System.getProperty("user.home"), ".assimbly", "security", "secrets.properties");
    }

    private static Properties read(Path file) {
        Properties properties = new Properties();
        if (Files.isRegularFile(file)) {
            try (InputStream in = Files.newInputStream(file)) {
                properties.load(in);
            } catch (IOException e) {
                throw new UncheckedIOException("Could not read the Gateway's secrets from " + file, e);
            }
        }
        return properties;
    }

    private static void write(Path file, Properties secrets) {
        try {
            Files.createDirectories(file.getParent());
            try (OutputStream out = Files.newOutputStream(file)) {
                secrets.store(
                    out,
                    "Secrets of this Gateway. Keep this file private, and keep it with the database: without it, encrypted values can't be read."
                );
            }
            PosixFileAttributeView posix = Files.getFileAttributeView(file, PosixFileAttributeView.class);
            if (posix != null) {
                posix.setPermissions(PosixFilePermissions.fromString("rw-------"));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Could not write the Gateway's secrets to " + file, e);
        }
    }

    private static String randomBase64(int bytes) {
        byte[] random = new byte[bytes];
        RANDOM.nextBytes(random);
        return Base64.getEncoder().encodeToString(random);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
