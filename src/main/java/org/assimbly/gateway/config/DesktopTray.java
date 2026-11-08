package org.assimbly.gateway.config;

import org.assimbly.gateway.GatewayApp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;

import javax.imageio.ImageIO;
import javax.swing.JDialog;
import javax.swing.JOptionPane;
import java.awt.AWTException;
import java.awt.Desktop;
import java.awt.MenuItem;
import java.awt.PopupMenu;
import java.awt.SystemTray;
import java.awt.TrayIcon;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.stream.Stream;

/**
 * The tray (Windows) or menu-bar (Mac) icon of a Gateway started from the bundle, which runs without a console window.
 * It tells the user that Assimbly starts and when it runs, and offers Open, the logs folder and Stop.
 */
public final class DesktopTray {

    private static final Logger log = LoggerFactory.getLogger(DesktopTray.class);

    private volatile TrayIcon icon;

    private volatile String url;

    private DesktopTray() {
    }

    /**
     * Shows the icon and "Assimbly is starting" once the configuration is read: after {@link SingleInstance}, so a
     * second start that only opens the running Gateway shows nothing.
     */
    public static DesktopTray showWhenStarting(SpringApplication application) {
        application.setHeadless(false);
        DesktopTray tray = new DesktopTray();
        application.addListeners(new ApplicationListener<ApplicationEnvironmentPreparedEvent>() {
            @Override
            public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
                tray.show();
            }
        });
        return tray;
    }

    private void show() {
        if (!SystemTray.isSupported()) {
            log.warn("This system has no tray; stop Assimbly by ending its process");
            return;
        }
        try (InputStream image = DesktopTray.class.getResourceAsStream("/desktop/tray-icon.png")) {
            TrayIcon trayIcon = new TrayIcon(ImageIO.read(image), "Assimbly is starting…");
            trayIcon.setImageAutoSize(true);
            trayIcon.setPopupMenu(menu());
            trayIcon.addActionListener(_ -> open());
            SystemTray.getSystemTray().add(trayIcon);
            trayIcon.displayMessage("Assimbly is starting",
                "This takes about 10 seconds. Your browser opens Assimbly when it is ready.", TrayIcon.MessageType.INFO);
            icon = trayIcon;
        } catch (IOException | AWTException | RuntimeException e) {
            log.warn("Could not show the Assimbly tray icon: {}", e.getMessage());
        }
    }

    private PopupMenu menu() {
        PopupMenu menu = new PopupMenu();
        menu.add(item("Open Assimbly", this::open));
        menu.add(item("Open logs folder", DesktopTray::openLogsFolder));
        menu.addSeparator();
        // The shutdown hook of Spring Boot closes the Gateway (Flows, broker, database) before the process ends.
        menu.add(item("Stop Assimbly", () -> System.exit(0)));
        return menu;
    }

    private static MenuItem item(String label, Runnable action) {
        MenuItem item = new MenuItem(label);
        item.addActionListener(_ -> action.run());
        return item;
    }

    /** Says that Assimbly runs; the browser opens right after. */
    public void running(String url) {
        this.url = url;
        TrayIcon trayIcon = icon;
        if (trayIcon != null) {
            trayIcon.setToolTip("Assimbly is running at " + url);
            trayIcon.displayMessage("Assimbly is running",
                "Opening " + url + " in your browser. Use this icon to open or stop Assimbly.", TrayIcon.MessageType.INFO);
        }
    }

    private void open() {
        if (url != null) {
            GatewayApp.openBrowser(url);
        }
    }

    private static void openLogsFolder() {
        Path logs = logsFolder();
        try {
            Files.createDirectories(logs);
            Desktop.getDesktop().open(logs.toFile());
        } catch (IOException | RuntimeException e) {
            log.warn("Could not open the logs folder {}: {}", logs, e.getMessage());
        }
    }

    /** Without a console window this dialog is the only sign that the start failed, so it names the log file to read. */
    public static void startFailed() {
        Path logFile = latestLogFile();
        String[] options = { "Open log file", "Close" };
        JOptionPane pane = new JOptionPane(
            "Assimbly could not start.\n\nThe log file tells why. Look for ERROR near the end of:\n" + logFile,
            JOptionPane.ERROR_MESSAGE, JOptionPane.DEFAULT_OPTION, null, options, options[0]);
        JDialog dialog = pane.createDialog("Assimbly could not start");
        // Windows opens a dialog of a process without a window behind the others; the user must see this one
        dialog.setAlwaysOnTop(true);
        dialog.setVisible(true);
        dialog.dispose();
        if (options[0].equals(pane.getValue())) {
            try {
                Desktop.getDesktop().open(logFile.toFile());
            } catch (IOException | RuntimeException e) {
                log.warn("Could not open {}: {}", logFile, e.getMessage());
            }
        }
    }

    /** The newest log the FILE appender of logback-spring.xml wrote, or the logs folder when there is none. */
    static Path latestLogFile() {
        Path logs = logsFolder();
        try (Stream<Path> files = Files.list(logs)) {
            return files.filter(file -> file.getFileName().toString().endsWith(".log"))
                .max(Comparator.comparingLong(file -> file.toFile().lastModified()))
                .orElse(logs);
        } catch (IOException _) {
            // No logs folder yet: point to where the logs go
            return logs;
        }
    }

    private static Path logsFolder() {
        return SingleInstance.folder().resolve("logs");
    }
}
