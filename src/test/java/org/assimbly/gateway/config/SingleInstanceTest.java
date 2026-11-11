package org.assimbly.gateway.config;

import org.apache.commons.logging.Log;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.env.StandardEnvironment;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;

/** A bundle start takes the base directory's lock; a second start finds it taken and the URL of the running Gateway. */
class SingleInstanceTest {

    private static final DeferredLogFactory LOGS = Supplier::get;

    private static final Log LOG = LOGS.getLog(SingleInstance.class);

    @TempDir
    Path folder;

    @AfterEach
    void freeTheLock() throws IOException {
        SingleInstance.release();
    }

    @Test
    void theFirstStartTakesTheLockAndForgetsAnOldUrl() throws IOException {
        Files.writeString(folder.resolve("gateway.url"), "http://localhost:8080/");

        assertThat(SingleInstance.acquire(folder, LOG)).isTrue();
        assertThat(SingleInstance.runningUrl(folder)).isEmpty();
    }

    @Test
    void aSecondStartFindsTheLockTakenAndTheRunningUrl() throws IOException {
        SingleInstance.acquire(folder, LOG);
        Files.writeString(folder.resolve("gateway.url"), "http://localhost:8081/");

        assertThat(SingleInstance.acquire(folder, LOG)).isFalse();
        assertThat(SingleInstance.runningUrl(folder)).contains("http://localhost:8081/");
    }

    @Test
    void aSecondStartWhileTheFirstStillStartsHasNoUrl() {
        SingleInstance.acquire(folder, LOG);

        assertThat(SingleInstance.acquire(folder, LOG)).isFalse();
        assertThat(SingleInstance.runningUrl(folder)).isEmpty();
    }

    @Test
    void withoutTheDesktopSettingNothingIsLocked() {
        String home = System.getProperty("user.home");
        System.setProperty("user.home", folder.toString());
        try {
            new SingleInstance(LOGS).postProcessEnvironment(new StandardEnvironment(), new SpringApplication());
        } finally {
            System.setProperty("user.home", home);
        }

        assertThat(folder.resolve(".assimbly")).doesNotExist();
    }
}
