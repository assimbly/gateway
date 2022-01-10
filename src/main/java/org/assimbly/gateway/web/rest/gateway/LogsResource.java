package org.assimbly.gateway.web.rest.gateway;

import io.swagger.v3.oas.annotations.Parameter;
import org.assimbly.gateway.web.rest.util.LogUtil;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.assimbly.gateway.web.rest.vm.LoggerVM;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.URISyntaxException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for view and managing Log Level at runtime.
 */
@RestController
@RequestMapping("/management")
public class LogsResource {

    @GetMapping("/logs")
    public List<LoggerVM> getList() {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        return context.getLoggerList()
            .stream()
            .map(LoggerVM::new)
            .collect(Collectors.toList());
    }

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
    @GetMapping(path = "/logs/{gatewayid}/log/{lines}", produces = {"text/plain"})
    public ResponseEntity<String> getLog(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long gatewayid, @PathVariable int lines) throws Exception {

        try {
            File file = new File(System.getProperty("java.io.tmpdir") + "/spring.log");
            String log = LogUtil.tail(file, lines);
            return ResponseUtil.createSuccessResponse(gatewayid, mediaType, "getLog", log, true);
        } catch (Exception e) {
            return ResponseUtil.createFailureResponse(gatewayid, mediaType, "getLog", e.getMessage());
        }
    }

}
