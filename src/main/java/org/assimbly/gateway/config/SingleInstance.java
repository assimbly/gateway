package org.assimbly.gateway.config;

import org.apache.commons.logging.Log;
import org.assimbly.gateway.GatewayApp;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.channels.OverlappingFileLockException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Optional;

/**
 * Keeps one Gateway per base directory when started from the Windows or Mac bundle
 * ({@code application.gateway.desktop}). Starting it again opens the browser on the Gateway that already runs and stops
 * the new start, so double-clicking the icon twice reopens the workspace instead of failing on the locked database.
 * <p>
 * The first Gateway locks {@code .assimbly/gateway.lock} for as long as it runs; the operating system frees the lock when
 * the process ends, also after a crash. Once started, it writes its Local URL to {@code .assimbly/gateway.url}.
 * <p>
 * Runs after {@link BaseDirectorySetting}, which sets the base directory, and before {@link PortFallback}, so a second
 * start stops before it is moved to the next free port.
 */
public class SingleInstance implements EnvironmentPostProcessor, Ordered {

    static final String DESKTOP = "application.gateway.desktop";

    public static final int ORDER = BaseDirectorySetting.ORDER + 1;

    private static final String LOCK_FILE = "gateway.lock";

    private static final String URL_FILE = "gateway.url";

    /** Held for the lifetime of the JVM: closing the channel would free the lock. */
    private static FileChannel lock;

    private final Log log;

    public SingleInstance(DeferredLogFactory logFactory) {
        this.log = logFactory.getLog(SingleInstance.class);
    }

    @Override
    public int getOrder() {
        return ORDER;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (!environment.getProperty(DESKTOP, Boolean.class, false)) {
            return;
        }
        Path folder = folder();
        if (acquire(folder)) {
            return;
        }
        // Logging is not set up yet and the start ends here, so the browser opening is the answer the user sees.
        runningUrl(folder).ifPresent(GatewayApp::openBrowser);
        System.exit(0);
    }

    /** True when this Gateway is the only one on the folder; false when another one holds the lock. */
    boolean acquire(Path folder) {
        try {
            Files.createDirectories(folder);
            FileChannel channel = FileChannel.open(folder.resolve(LOCK_FILE), StandardOpenOption.CREATE, StandardOpenOption.WRITE);
            if (!tryLock(channel)) {
                channel.close();
                return false;
            }
            lock = channel;
            Files.deleteIfExists(folder.resolve(URL_FILE));
            return true;
        } catch (IOException e) {
            log.warn("Could not check whether Assimbly already runs (" + e.getMessage() + "); starting anyway");
            return true;
        }
    }

    private static boolean tryLock(FileChannel channel) throws IOException {
        try {
            return channel.tryLock() != null;
        } catch (OverlappingFileLockException _) {
            // Held by this JVM already, which only happens in tests
            return false;
        } catch (IOException e) {
            channel.close();
            throw e;
        }
    }

    /** Lets a later start of the bundle open this Gateway; only the Gateway that holds the lock writes it. */
    public static void publishUrl(String url) throws IOException {
        if (lock != null) {
            Files.writeString(folder().resolve(URL_FILE), url);
        }
    }

    static Optional<String> runningUrl(Path folder) {
        try {
            String url = Files.readString(folder.resolve(URL_FILE)).trim();
            return url.isEmpty() ? Optional.empty() : Optional.of(url);
        } catch (IOException _) {
            // No URL yet: the running Gateway is still starting and opens the browser itself.
            return Optional.empty();
        }
    }

    /** The {@code .assimbly} folder in the base directory; {@link BaseDirectorySetting} has set user.home to it. */
    static Path folder() {
        return Path.of(System.getProperty("user.home"), ".assimbly");
    }

    /** Frees the lock; for tests. */
    static void release() throws IOException {
        if (lock != null) {
            lock.close();
            lock = null;
        }
    }
}
