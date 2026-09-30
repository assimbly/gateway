package org.assimbly.gateway.web.rest.gateway;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.assimbly.gateway.web.rest.customvm.LoggerVM;
import org.assimbly.gateway.web.rest.util.LogUtil;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.URISyntaxException;
import java.util.List;

/**
 * Controller for view and managing Log Level at runtime.
 */
@Tag(name = "Logging", description = "View and change loggers")
@RestController
@RequestMapping("/management")
public class LogsResource {

    @Operation(summary = "List loggers")
    @GetMapping("/logs")
    public List<LoggerVM> getList() {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        return context.getLoggerList()
            .stream()
            .map(LoggerVM::new)
            .toList();
    }

    @Operation(summary = "Change the level of a logger")
    @PutMapping("/logs")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeLevel(@RequestBody LoggerVM jsonLogger) {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        context.getLogger(jsonLogger.getName()).setLevel(Level.valueOf(jsonLogger.getLevel()));
    }

    /**
     * Get  /getlog : get tail of log file for the webapplication.
     *
     * @param lines (number of lines to return)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @Operation(summary = "Get the last lines of the integration log")
    @GetMapping(
        path = "/logs/{integrationid}/log/{lines}",
        produces = {MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getLog(
        @PathVariable(value = "integrationid") Long integrationId,
        @PathVariable(value = "lines") int lines,
        @Parameter(hidden = true) @RequestHeader(value = "Accept") String mediaType
    ) throws Exception {

        try {
            File file = new File(System.getProperty("java.io.tmpdir") + "/spring.log");
            String log = LogUtil.tail(file, lines);
            return ResponseUtil.createSuccessResponse(integrationId, mediaType, "getLog", log, true);
        } catch (Exception e) {
            return ResponseUtil.createFailureResponse(integrationId, mediaType, "getLog", e.getMessage());
        }
    }

}
