package org.assimbly.gateway.web.rest.gateway;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Temporary same-origin sink for debug-mode NDJSON (CSP blocks 127.0.0.1 ingest).
 * Remove after translation/auth debug session.
 */
@RestController
@RequestMapping("/api/_agent-debug")
public class AgentDebugResource {

    private static final Path LOG_PATH = Path.of("debug-eb2e16.log");

    @PostMapping("/log")
    public ResponseEntity<Void> log(@RequestBody String payload) throws IOException {
        Files.writeString(LOG_PATH, payload + System.lineSeparator(), StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        return ResponseEntity.noContent().build();
    }
}
