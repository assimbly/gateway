package org.assimbly.gateway.config.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Properties;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.mock.env.MockEnvironment;

/** Every Gateway gets secrets of its own, unless its configuration sets them. */
class GeneratedSecretsTest {

    private static final DeferredLogFactory LOGS = Supplier::get;

    /** Token keys of 512 bits, the least HS512 takes. */
    private static final String CONFIGURED_JWT = key('c');
    private static final String SERVER_JWT = key('s');

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
            .withProperty(GeneratedSecrets.JWT_SECRET, CONFIGURED_JWT)
            .withProperty(GeneratedSecrets.ENCRYPTION_SECRET, "configured-key");

        process(env);

        assertThat(env.getProperty(GeneratedSecrets.JWT_SECRET)).isEqualTo(CONFIGURED_JWT);
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
    void theRuntimeJwtSecretIsTheTokenKeyWhenSet() {
        MockEnvironment env = process(
            new MockEnvironment()
                .withProperty(GeneratedSecrets.RUNTIME_JWT_SECRET, SERVER_JWT)
                .withProperty(GeneratedSecrets.RUNTIME_ENCRYPTION_SECRET, "server-key")
        );

        assertThat(env.getProperty(GeneratedSecrets.JWT_SECRET)).isEqualTo(SERVER_JWT);
        assertThat(home.resolve(".assimbly/security/secrets.properties")).doesNotExist();
    }

    @Test
    void aConfiguredTokenKeyWinsOverTheRuntimeOne() {
        MockEnvironment env = process(
            new MockEnvironment()
                .withProperty(GeneratedSecrets.JWT_SECRET, CONFIGURED_JWT)
                .withProperty(GeneratedSecrets.RUNTIME_JWT_SECRET, SERVER_JWT)
        );

        assertThat(env.getProperty(GeneratedSecrets.JWT_SECRET)).isEqualTo(CONFIGURED_JWT);
    }

    @Test
    void headlessGetsATokenKeyOfItsOwnToo() {
        // Headless configures its encryption key, but no longer a (published) token key
        MockEnvironment env = new MockEnvironment().withProperty(GeneratedSecrets.ENCRYPTION_SECRET, "headless-key");
        env.setActiveProfiles("headless");

        process(env);

        assertThat(env.getProperty(GeneratedSecrets.JWT_SECRET)).isNotBlank();
        assertThat(env.getProperty(GeneratedSecrets.ENCRYPTION_SECRET)).isEqualTo("headless-key");
        assertThat(home.resolve(".assimbly/security/secrets.properties")).exists();
    }

    @Test
    void aTokenKeyThatIsTooShortStopsTheStart() {
        String short256 = Base64.getEncoder().encodeToString("s".repeat(32).getBytes());
        MockEnvironment env = new MockEnvironment().withProperty(GeneratedSecrets.RUNTIME_JWT_SECRET, short256);

        assertThatThrownBy(() -> process(env))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("256 bits")
            .hasMessageContaining("openssl rand -base64 64");
    }

    @Test
    void aSecretsFolderThatCantBeWrittenSaysWhatToDo() throws IOException {
        // A file where the home folder should be: nothing can be created in it
        Path notAFolder = Files.createFile(home.resolve("not-a-folder"));
        System.setProperty("user.home", notAFolder.toString());
        MockEnvironment env = new MockEnvironment().withProperty(GeneratedSecrets.ENCRYPTION_SECRET, "headless-key");

        assertThatThrownBy(() -> process(env))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Could not store the Gateway's secrets")
            .hasMessageContaining("Make that folder writable, or set ASSIMBLY_JWT_SECRET.");
    }

    @Test
    void aSecretsFolderThatCantBeWrittenNamesBothVariablesWhenBothAreMissing() throws IOException {
        Path notAFolder = Files.createFile(home.resolve("not-a-folder"));
        System.setProperty("user.home", notAFolder.toString());

        assertThatThrownBy(() -> process(new MockEnvironment()))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("set ASSIMBLY_JWT_SECRET and ASSIMBLY_ENCRYPTION_SECRET.");
    }

    private static String key(char c) {
        return Base64.getEncoder().encodeToString(String.valueOf(c).repeat(64).getBytes());
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
