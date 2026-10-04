package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.FlowAlertsPageDTO;
import org.assimbly.util.BaseDirectory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

/**
 * Reads the alert logs written for a flow. Each alert is one line. The runtime
 * count adds handled failures on top of failed exchanges, so the log is the
 * count shown in the UI.
 */
@Service
public class FlowAlertLogService {

    public static final int PAGE_SIZE = 10;

    private static final Logger log = LoggerFactory.getLogger(FlowAlertLogService.class);

    private static final String ALERT_LOG_SUFFIX = "_alerts.log";

    /** Where cleared alert logs go, inside the flow's alert directory. {@link #page} doesn't look into it. */
    static final String CLEARED_DIR = "cleared";

    private final Path alertsRoot;

    @Autowired
    public FlowAlertLogService() {
        this(Path.of(BaseDirectory.getInstance().getBaseDirectory(), "alerts"));
    }

    FlowAlertLogService(Path alertsRoot) {
        this.alertsRoot = alertsRoot;
    }

    public FlowAlertsPageDTO page(long flowId, int offset, int limit) {
        int safeOffset = Math.max(offset, 0);
        int safeLimit = Math.min(Math.max(limit, 0), PAGE_SIZE);
        List<String> lines = readNewestFirst(flowId);

        FlowAlertsPageDTO page = new FlowAlertsPageDTO();
        page.setTotal(lines.size());
        int from = Math.min(safeOffset, lines.size());
        int to = Math.min(from + safeLimit, lines.size());
        page.setMessages(new ArrayList<>(lines.subList(from, to)));
        return page;
    }

    /**
     * Clears a flow's alerts for everyone by moving its alert logs into the {@value #CLEARED_DIR} folder of the
     * flow's alert directory. Nothing is deleted. A log the runtime still holds open is copied there and emptied.
     *
     * @throws UncheckedIOException when an alert log can't be moved aside
     */
    public void clear(long flowId) {
        List<Path> files = alertLogs(flowId);
        if (files.isEmpty()) {
            return;
        }
        Path clearedDir = alertsRoot.resolve(Long.toString(flowId)).resolve(CLEARED_DIR);
        try {
            Files.createDirectories(clearedDir);
            for (Path file : files) {
                Path target = unusedName(clearedDir, file.getFileName().toString());
                try {
                    Files.move(file, target);
                } catch (IOException moveFailed) {
                    Files.copy(file, target);
                    Files.newOutputStream(file, StandardOpenOption.TRUNCATE_EXISTING).close();
                }
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Could not clear the alerts of flow " + flowId, e);
        }
    }

    /** The name in the cleared folder: the log's own name, or with a number added when a log of that name was cleared before. */
    private static Path unusedName(Path dir, String fileName) {
        Path target = dir.resolve(fileName);
        for (int i = 1; Files.exists(target); i++) {
            target = dir.resolve(fileName + "." + i);
        }
        return target;
    }

    private List<Path> alertLogs(long flowId) {
        Path flowDir = alertsRoot.resolve(Long.toString(flowId));
        if (!Files.isDirectory(flowDir)) {
            return List.of();
        }
        try (Stream<Path> listing = Files.list(flowDir)) {
            return listing
                .filter(path -> Files.isRegularFile(path) && path.getFileName().toString().endsWith(ALERT_LOG_SUFFIX))
                .sorted(Comparator.comparing((Path path) -> path.getFileName().toString()).reversed())
                .toList();
        } catch (IOException e) {
            log.warn("Could not list alert logs for flow {}", flowId, e);
            return List.of();
        }
    }

    private List<String> readNewestFirst(long flowId) {
        List<Path> files = alertLogs(flowId);

        List<String> lines = new ArrayList<>();
        for (Path file : files) {
            try {
                List<String> fileLines = Files.readAllLines(file, StandardCharsets.UTF_8);
                for (int i = fileLines.size() - 1; i >= 0; i--) {
                    String line = fileLines.get(i).trim();
                    if (!line.isEmpty()) {
                        lines.add(line);
                    }
                }
            } catch (IOException e) {
                log.warn("Could not read alert log {}", file, e);
            }
        }
        return lines;
    }
}
