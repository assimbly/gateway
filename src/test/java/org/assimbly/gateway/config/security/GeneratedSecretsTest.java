package org.assimbly.gateway.config.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.mock.env.MockEnvironment;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Properties;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;

/** Every Gateway gets secrets of its own, unless its configuration sets them. */
class GeneratedSecretsTest {

    private static final DeferredLogFactory LOGS = Supplier::get;

    @TempDir
    Path home;

    private String previousHome;

    @BeforeEach
    void useTemporaryHome() {
        previousHome = System.getProperty("user.home");
        System.setProperty("user.home", home.toString());
    }

    @AfterEach
    void restoreHome() {
        System.setProperty("user.home", previousHome);
    }

    @Test
    void aNewGatewayGeneratesItsSecretsAndKeepsThem() throws IOException {
        MockEnvironment first = process(new MockEnvironment());

        Path file = home.resolve(".assimbly/security/secrets.properties");
        assertThat(file).exists();
        Properties stored = read(file);
        assertThat(first.getProperty(GeneratedSecrets.JWT_SECRET)).isEqualTo(stored.getProperty(GeneratedSecrets.JWT_SECRET));
        assertThat(first.getProperty(GeneratedSecrets.ENCRYPTION_SECRET)).isEqualTo(stored.getProperty(GeneratedSecrets.ENCRYPTION_SECRET));
        // 512 bits for the token key
        assertThat(Base64.getDecoder().decode(first.getProperty(GeneratedSecrets.JWT_SECRET))).hasSize(64);

        MockEnvironment second = process(new MockEnvironment());
        assertThat(second.getProperty(GeneratedSecrets.JWT_SECRET)).isEqualTo(first.getProperty(GeneratedSecrets.JWT_SECRET));
        assertThat(second.getProperty(GeneratedSecrets.ENCRYPTION_SECRET)).isEqualTo(first.getProperty(GeneratedSecrets.ENCRYPTION_SECRET));
    }

    @Test
    void twoGatewaysGetDifferentSecrets() {
        String first = process(new MockEnvironment()).getProperty(GeneratedSecrets.JWT_SECRET);
        System.setProperty("user.home", home.resolve("other").toString());

        assertThat(process(new MockEnvironment()).getProperty(GeneratedSecrets.JWT_SECRET)).isNotEqualTo(first);
    }

    @Test
    void configuredSecretsWin() {
        MockEnvironment env = new MockEnvironment()
            .withProperty(GeneratedSecrets.JWT_SECRET, "configured-jwt")
            .withProperty(GeneratedSecrets.ENCRYPTION_SECRET, "configured-key");

        process(env);

        assertThat(env.getProperty(GeneratedSecrets.JWT_SECRET)).isEqualTo("configured-jwt");
        assertThat(env.getProperty(GeneratedSecrets.ENCRYPTION_SECRET)).isEqualTo("configured-key");
        assertThat(home.resolve(".assimbly/security/secrets.properties")).doesNotExist();
    }

    @Test
    void theRuntimeSecretIsTheEncryptionKeyWhenSet() {
        MockEnvironment env = process(new MockEnvironment().withProperty(GeneratedSecrets.RUNTIME_ENCRYPTION_SECRET, "runtime-key"));

        assertThat(env.getProperty(GeneratedSecrets.ENCRYPTION_SECRET)).isEqualTo("runtime-key");
        assertThat(env.getProperty(GeneratedSecrets.JWT_SECRET)).isNotBlank();
    }

    @Test
    void headlessIsLeftAlone() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("headless");

        process(env);

        assertThat(env.getProperty(GeneratedSecrets.JWT_SECRET)).isNull();
        assertThat(home.resolve(".assimbly")).doesNotExist();
    }

    private static MockEnvironment process(MockEnvironment env) {
        new GeneratedSecrets(LOGS).postProcessEnvironment(env, new SpringApplication());
        return env;
    }

    private static Properties read(Path file) throws IOException {
        Properties properties = new Properties();
        try (InputStream in = Files.newInputStream(file)) {
            properties.load(in);
        }
        return properties;
    }
}
