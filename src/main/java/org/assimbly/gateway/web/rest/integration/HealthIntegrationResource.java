package org.assimbly.gateway.web.rest.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Parameter;
import org.assimbly.gateway.service.HealthService;
import org.assimbly.gateway.service.response.BackendResponse;
import org.assimbly.integration.Integration;
import org.assimbly.integrationrest.IntegrationRuntime;
import org.assimbly.util.rest.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryUsage;
import java.lang.management.ThreadMXBean;
import java.nio.charset.StandardCharsets;

/**
 * REST controller for getting the {@link AuditEvent}s.
 */
@RestController
@RequestMapping("/health/backend")
public class HealthIntegrationResource {

    protected Logger log = LoggerFactory.getLogger(getClass());

    private final HealthService healthService;

    public HealthIntegrationResource(HealthService healthService) {
        this.healthService = healthService;
    }

    @Autowired
    private IntegrationRuntime integrationRuntime;

    private Integration integration;

    private boolean plainResponse;

    @GetMapping(
        path = "/flows",
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getFlowStats(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType) throws Exception {

        plainResponse = true;
        long connectorId = 1;
        integration = integrationRuntime.getIntegration();

        try {
            String stats = integration.getStats(mediaType);
            if(stats.startsWith("Error")||stats.startsWith("Warning")) {plainResponse = false;}
            return org.assimbly.util.rest.ResponseUtil.createSuccessResponse(connectorId, mediaType, "/health/flow", stats, plainResponse);
        } catch (Exception e) {
            log.error("Get flow failed",e);
            return ResponseUtil.createFailureResponse(connectorId, mediaType,"/health/flow",e.getMessage());
        }
    }

    @GetMapping(
        path = "/jvm",
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getJvmStats(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType) throws Exception {

        plainResponse = true;
        long connectorId = 1;

        try {
            final ByteArrayOutputStream out = new ByteArrayOutputStream();
            final ObjectMapper mapper = new ObjectMapper();
            final BackendResponse backendResponse = new BackendResponse();
            final ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();

            MemoryUsage mem = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();

            backendResponse.addMemory("current", healthService.convertSizeToKb(mem.getUsed()));
            backendResponse.addMemory("max", healthService.convertSizeToKb(mem.getMax()));
            backendResponse.addMemory("committed", healthService.convertSizeToKb(mem.getCommitted()));
            backendResponse.addMemory("cached", healthService.convertSizeToKb(mem.getCommitted() - mem.getUsed()));
            backendResponse.addMemory("currentUsedPercentage", (mem.getUsed() * 100 / mem.getMax()));

            backendResponse.addThread("threadCount", threadMXBean.getThreadCount());
            backendResponse.addThread("peakThreadCount", threadMXBean.getPeakThreadCount());

            backendResponse.addJvm("openFileDescriptors", healthService.invokeMethod("getOpenFileDescriptorCount"));
            backendResponse.addJvm("maxFileDescriptors", healthService.invokeMethod("getMaxFileDescriptorCount"));

            mapper.writeValue(out, backendResponse);
            return org.assimbly.util.rest.ResponseUtil.createSuccessResponse(connectorId, mediaType, "/health/jvm", out.toString(StandardCharsets.UTF_8), plainResponse);
        } catch (Exception e) {
            log.error("Get jvm failed",e);
            return ResponseUtil.createFailureResponse(connectorId, mediaType,"/health/jvm",e.getMessage());
        }
    }
}
