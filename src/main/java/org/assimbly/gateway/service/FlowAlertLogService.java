package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.FlowAlertsPageDTO;
import org.assimbly.util.BaseDirectory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
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

    private List<String> readNewestFirst(long flowId) {
        Path flowDir = alertsRoot.resolve(Long.toString(flowId));
        if (!Files.isDirectory(flowDir)) {
            return List.of();
        }

        List<Path> files;
        try (Stream<Path> listing = Files.list(flowDir)) {
            files = listing
                .filter(path -> Files.isRegularFile(path) && path.getFileName().toString().endsWith(ALERT_LOG_SUFFIX))
                .sorted(Comparator.comparing((Path path) -> path.getFileName().toString()).reversed())
                .toList();
        } catch (IOException e) {
            log.warn("Could not list alert logs for flow {}", flowId, e);
            return List.of();
        }

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
