package org.assimbly.gateway.service;

import org.assimbly.gateway.service.dto.FlowAlertsPageDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class FlowAlertLogServiceTest {

    @TempDir
    Path tempDir;

    @Test
    public void pagesNewestAlertsAndCountsEachLineOnce() throws Exception {
        Path flowDir = tempDir.resolve("1201");
        Files.createDirectories(flowDir);
        Files.writeString(
            flowDir.resolve("20260920_alerts.log"),
            String.join("\n", IntStream.rangeClosed(1, 12).mapToObj(i -> "old-" + i).toList()),
            StandardCharsets.UTF_8
        );
        Files.writeString(
            flowDir.resolve("20260921_alerts.log"),
            "new-1\n\nnew-2\nnew-3\nnew-4\n",
            StandardCharsets.UTF_8
        );

        FlowAlertLogService service = new FlowAlertLogService(tempDir);

        FlowAlertsPageDTO first = service.page(1201, 0, 10);
        assertEquals(16, first.getTotal());
        assertEquals(List.of("new-4", "new-3", "new-2", "new-1", "old-12", "old-11", "old-10", "old-9", "old-8", "old-7"), first.getMessages());

        FlowAlertsPageDTO second = service.page(1201, 10, 10);
        assertEquals(16, second.getTotal());
        assertEquals(List.of("old-6", "old-5", "old-4", "old-3", "old-2", "old-1"), second.getMessages());

        FlowAlertsPageDTO countOnly = service.page(1201, 0, 0);
        assertEquals(16, countOnly.getTotal());
        assertEquals(List.of(), countOnly.getMessages());
    }

    @Test
    public void clearingMovesTheAlertsAsideSoTheyAreNoLongerShown() throws Exception {
        Path flowDir = tempDir.resolve("1202");
        Files.createDirectories(flowDir);
        Files.writeString(flowDir.resolve("20260920_alerts.log"), "first\nsecond\n", StandardCharsets.UTF_8);
        Files.writeString(flowDir.resolve("20260921_alerts.log"), "third\n", StandardCharsets.UTF_8);
        FlowAlertLogService service = new FlowAlertLogService(tempDir);

        service.clear(1202);

        FlowAlertsPageDTO page = service.page(1202, 0, 10);
        assertEquals(0, page.getTotal());
        assertEquals(List.of(), page.getMessages());
        assertEquals("first\nsecond\n", Files.readString(flowDir.resolve("cleared").resolve("20260920_alerts.log")));
        assertEquals("third\n", Files.readString(flowDir.resolve("cleared").resolve("20260921_alerts.log")));
    }

    @Test
    public void alertsWrittenAfterClearingAreShownAgainAndAClearAgainKeepsTheEarlierOnes() throws Exception {
        Path flowDir = tempDir.resolve("1203");
        Files.createDirectories(flowDir);
        Files.writeString(flowDir.resolve("20260920_alerts.log"), "before\n", StandardCharsets.UTF_8);
        FlowAlertLogService service = new FlowAlertLogService(tempDir);
        service.clear(1203);

        Files.writeString(flowDir.resolve("20260920_alerts.log"), "after\n", StandardCharsets.UTF_8);
        assertEquals(List.of("after"), service.page(1203, 0, 10).getMessages());

        service.clear(1203);

        assertEquals(0, service.page(1203, 0, 10).getTotal());
        try (var cleared = Files.list(flowDir.resolve("cleared"))) {
            List<String> contents = cleared.map(path -> {
                try {
                    return Files.readString(path).trim();
                } catch (java.io.IOException e) {
                    throw new java.io.UncheckedIOException(e);
                }
            }).sorted().toList();
            assertEquals(List.of("after", "before"), contents);
        }
    }

    @Test
    public void addedAlertsGoToTodaysLogAfterTheTimeAndAreClearedLikeTheOthers() throws Exception {
        Path flowDir = tempDir.resolve("1204");
        Files.createDirectories(flowDir);
        Files.writeString(flowDir.resolve("20260920_alerts.log"), "2026-09-20 10:00:00 +0200 : Cannot store file\n", StandardCharsets.UTF_8);
        FlowAlertLogService service = new FlowAlertLogService(tempDir);

        service.add(1204, List.of("Failed to start [file://in]: Multiple consumers\r\nfor the same endpoint", "  ", "Failed to start: busy"));

        String today = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        List<String> written = Files.readAllLines(flowDir.resolve(today + "_alerts.log"));
        assertEquals(2, written.size());
        assertTrue(written.get(0).matches("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} [+-]\\d{4} : Failed to start \\[file://in\\]: Multiple consumers for the same endpoint"));

        List<String> page = service.page(1204, 0, 10).getMessages();
        assertEquals(3, page.size());
        assertTrue(page.get(0).endsWith(" : Failed to start: busy"));
        assertEquals("2026-09-20 10:00:00 +0200 : Cannot store file", page.get(2));

        service.clear(1204);
        assertEquals(0, service.page(1204, 0, 10).getTotal());
    }

    @Test
    public void addingCutsOffLongAndManyAlerts() {
        FlowAlertLogService service = new FlowAlertLogService(tempDir);

        service.add(1205, IntStream.range(0, 30).mapToObj(i -> "x".repeat(5000)).toList());

        List<String> page = service.page(1205, 0, 10).getMessages();
        assertEquals(FlowAlertLogService.MAX_ADDED, service.page(1205, 0, 0).getTotal());
        assertTrue(page.get(0).endsWith("x".repeat(FlowAlertLogService.MAX_LENGTH) + "…"));
    }

    @Test
    public void clearingAFlowWithoutAlertsDoesNothing() {
        new FlowAlertLogService(tempDir).clear(998);

        assertEquals(false, Files.exists(tempDir.resolve("998")));
    }

    @Test
    public void missingFlowHasNoAlerts() {
        FlowAlertsPageDTO page = new FlowAlertLogService(tempDir).page(999, 0, 10);
        assertEquals(0, page.getTotal());
        assertEquals(List.of(), page.getMessages());
    }
}
