package org.assimbly.gateway.config;

import org.assimbly.gateway.config.security.GeneratedSecrets;
import org.assimbly.util.BaseDirectory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.mock.env.MockEnvironment;

import java.nio.file.Path;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;

/** application.gateway.base-directory from the configuration moves the Gateway's folders, like the -d= start argument. */
class BaseDirectorySettingTest {

    private static final DeferredLogFactory LOGS = Supplier::get;

    @TempDir
    Path folder;

    private String previousHome;
    private String previousBaseDirectory;

    @BeforeEach
    void remember() {
        previousHome = System.getProperty("user.home");
        previousBaseDirectory = BaseDirectory.getInstance().getBaseDirectory();
    }

    @AfterEach
    void restore() {
        System.setProperty("user.home", previousHome);
        BaseDirectory.getInstance().setBaseDirectory(previousBaseDirectory);
    }

    private void apply(String value) {
        MockEnvironment environment = new MockEnvironment();
        if (value != null) {
            environment.setProperty(BaseDirectorySetting.BASE_DIRECTORY, value);
        }
        new BaseDirectorySetting(LOGS).postProcessEnvironment(environment, new SpringApplication());
    }

    @Test
    void theFolderHoldsAssimbly() {
        apply(folder.toString());

        assertThat(System.getProperty("user.home")).isEqualTo(folder.toString());
        assertThat(Path.of(BaseDirectory.getInstance().getBaseDirectory())).isEqualTo(folder.resolve(".assimbly"));
        assertThat(GeneratedSecrets.secretsFile()).startsWithRaw(folder.resolve(".assimbly"));
    }

    @Test
    void aTrailingSlashMeansTheSameFolder() {
        apply(folder + "/");

        assertThat(System.getProperty("user.home")).isEqualTo(folder.toString());
    }

    @Test
    void defaultOrNothingLeavesTheHomeFolder() {
        apply("default");
        assertThat(System.getProperty("user.home")).isEqualTo(previousHome);

        apply(null);
        assertThat(System.getProperty("user.home")).isEqualTo(previousHome);
        assertThat(BaseDirectory.getInstance().getBaseDirectory()).isEqualTo(previousBaseDirectory);
    }

    @Test
    void runsBeforeTheSecretsAreGenerated() {
        assertThat(new BaseDirectorySetting(LOGS).getOrder()).isLessThan(new GeneratedSecrets(LOGS).getOrder());
    }
}
