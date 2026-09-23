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
    public void missingFlowHasNoAlerts() {
        FlowAlertsPageDTO page = new FlowAlertLogService(tempDir).page(999, 0, 10);
        assertEquals(0, page.getTotal());
        assertEquals(List.of(), page.getMessages());
    }
}
