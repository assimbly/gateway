package org.assimbly.gateway.web.rest.broker;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Parameter;
import org.assimbly.brokerrest.ManagedBrokerRuntime;
import org.assimbly.gateway.service.HealthService;
import org.assimbly.util.rest.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * REST controller for getting the {@link AuditEvent}s.
 */
@RestController
@RequestMapping("/health")
public class HealthBrokerResource {

    protected Logger log = LoggerFactory.getLogger(getClass());

    public HealthBrokerResource(HealthService healthService) { }

    @Autowired
    private ManagedBrokerRuntime managedBroker;

    private boolean plainResponse;

    @GetMapping(
        path = "/broker",
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getBrokerStats(@Parameter(hidden = true) @RequestHeader("Accept") String mediaType) throws Exception {

        plainResponse = true;
        long connectorId = 1;

        try {
            final ByteArrayOutputStream out = new ByteArrayOutputStream();
            final ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> statsMap = managedBroker.getStats("classic");

            mapper.writeValue(out, statsMap);

            return ResponseUtil.createSuccessResponse(connectorId, mediaType, "/health/broker", out.toString(StandardCharsets.UTF_8), plainResponse);
        } catch (Exception e) {
            log.error("Get broker failed",e);
            return ResponseUtil.createFailureResponse(connectorId, mediaType,"/health/broker",e.getMessage());
        }
    }
}
