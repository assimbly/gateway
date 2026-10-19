package org.assimbly.gateway.web.rest.integration;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.config.exporting.FluxygenExport;
import org.assimbly.gateway.config.importing.Import;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@Tag(name = "Configuration", description = "Import and export the configuration of integrations and flows")
@RestController
@RequestMapping("/api")
public class EnvironmentResource {

    private final Logger log = LoggerFactory.getLogger(EnvironmentResource.class);

	@Autowired
    private Export confExport;

	@Autowired
    private Import confImport;

	@Autowired
    private FluxygenExport fluxygenExport;

	private String configuration;

	/**
     * POST  /configuration/{integrationid}/setconfiguration : Set configuration from XML.
     *
     * @param integrationid (by integrationId)
     * @param configuration as xml
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @Operation(summary = "Import the configuration of an integration")
    @PostMapping(
        path = "/environment/{integrationid}",
        consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE},
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> setGatewayConfiguration(
        @PathVariable(value = "integrationid") Long integrationid,
        @RequestBody String configuration,
        @Parameter(hidden = true) @RequestHeader(value = "Accept") String mediaType,
        @Parameter(hidden = true) @RequestHeader(value = "Content-Type") String contentType
    ) throws Exception {

       	try {
       		log.info("Importing configuration into database");
        	confImport.convertConfigurationToDB(integrationid, contentType, configuration);
        	return ResponseUtil.createSuccessResponse(integrationid, mediaType, "setConfiguration", "Gateway configuration set");
   		} catch (Exception e) {
            log.error("Import of configuration failed: {}", e.getMessage(), e);
            return ResponseUtil.createFailureResponse(integrationid, mediaType, "setConfiguration", e.getMessage());
   		}

    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param integrationid (by integrationid)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @Operation(summary = "Export the configuration of an integration")
    @GetMapping(
        path = "/environment/{integrationid}",
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getGatewayConfiguration(
        @PathVariable(value = "integrationid") Long integrationid,
        @Parameter(hidden = true) @RequestHeader(value = "Accept") String mediaType,
        @RequestHeader(value = "PlaceholderReplacement") boolean isPlaceholderReplacement
    ) throws Exception {

       	try {
			configuration = confExport.convertDBToConfiguration(integrationid, mediaType,isPlaceholderReplacement);
			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
                log.error("Failed to get configuration: {}", configuration);
				return ResponseUtil.createFailureResponse(integrationid, mediaType, "getGatewayConfiguration", configuration);
			}
			return ResponseUtil.createSuccessResponse(integrationid, mediaType, "getGatewayConfiguration", configuration, true);

   		} catch (Exception e) {
            log.error("Failed to get configuration: {}", e.getMessage(), e);
   			return ResponseUtil.createFailureResponse(integrationid, mediaType, "getGatewayConfiguration", e.getMessage());
   		}

    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway by list of flow ids.
     *
     * @param integrationid (by integrationid)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @Operation(summary = "Export the configuration of the given flows")
    @PostMapping(
        path = "/environment/{integrationid}/byflowids",
        consumes = {MediaType.TEXT_PLAIN_VALUE},
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getConfigurationByFlowids(
        @PathVariable(value = "integrationid") Long integrationid,
        @RequestBody String flowids,
        @Parameter(hidden = true) @RequestHeader(value = "Accept") String mediaType,
        @RequestHeader(value = "PlaceholderReplacement") boolean isPlaceholderReplacement
    ) throws Exception {

       	try {
			configuration = confExport.convertDBToConfigurationByFlowIds(integrationid, mediaType, flowids, isPlaceholderReplacement);
			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
				return ResponseUtil.createFailureResponse(integrationid, mediaType, "getConfigurationByFlowids", configuration);
			}
			return ResponseUtil.createSuccessResponse(integrationid, mediaType, "getConfigurationByFlowids", configuration, true);

   		} catch (Exception e) {
            log.error("Failed to get configuration by flowids: {}", e.getMessage(), e);
   			return ResponseUtil.createFailureResponse(integrationid, mediaType, "getConfigurationByFlowids", e.getMessage());
   		}

    }

    /**
     * POST  /setflowconfiguration : Set configuration from XML.
     *
     * @param flowid (FlowId)
     * @param configuration as XML / if empty get from db (for the time being)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @Operation(summary = "Import the configuration of a flow")
    @PostMapping(
        path = "/environment/{integrationid}/flow/{flowid}",
        consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE},
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> setFlowConfiguration(
        @PathVariable(value = "integrationid") Long integrationid,
        @PathVariable(value = "flowid") Long flowid,
        @RequestBody String configuration,
        @Parameter(hidden = true) @RequestHeader(value = "Accept") String mediaType
    ) throws Exception {
        try {
       		confImport.convertFlowConfigurationToDB(integrationid, flowid, mediaType, configuration);
			return ResponseUtil.createSuccessResponse(integrationid, mediaType, "setFlowConfiguration", "Flow configuration set");
   		} catch (Exception e) {
            log.error("Failed to set configuration: {} for flowid={}", e.getMessage(), flowid, e);
   			return ResponseUtil.createFailureResponse(integrationid, mediaType, "setFlowConfiguration", e.getMessage());
   		}
    }

    /**
     * Get  /getconfiguration : get XML configuration for gateway.
     *
     * @param flowid (flowId)
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the configuration failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @Operation(summary = "Export the configuration of a flow")
    @GetMapping(
        path = "/environment/{integrationid}/flow/{flowid}",
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_PLAIN_VALUE}
    )
    public ResponseEntity<String> getFlowConfiguration(
        @PathVariable(value = "integrationid") Long integrationid,
        @PathVariable(value = "flowid") Long flowid,
        @Parameter(hidden = true) @RequestHeader(value = "Accept") String mediaType,
        @RequestHeader(value = "PlaceholderReplacement") boolean isPlaceholderReplacement
    ) throws Exception {
       	try {
            configuration = confExport.convertDBToFlowConfiguration(flowid, mediaType, isPlaceholderReplacement);

			if(configuration.startsWith("Error")||configuration.startsWith("Warning")) {
				return ResponseUtil.createFailureResponse(integrationid, mediaType, "getFlowConfiguration", configuration);
			}
			return ResponseUtil.createSuccessResponse(integrationid, mediaType, "getFlowConfiguration", configuration, true);
   		} catch (Exception e) {
            log.error("Failed to get configuration: {} for flowid={}", e.getMessage(), flowid, e);
   			return ResponseUtil.createFailureResponse(integrationid, mediaType, "getFlowConfiguration", e.getMessage());
   		}
    }

    /** What to export for Fluxygen: the Flows (all when empty) and the passphrase that protects their secrets. */
    public record FluxygenExportRequest(List<Long> flowIds, char[] passphrase) {}

    /**
     * POST  /environment/{integrationid}/fluxygen-export : the Flows as a zip for Fluxygen, one DIL per Flow in the
     * groupless group, with their secrets encrypted with the passphrase. A POST, so the passphrase never sits in a URL.
     *
     * @param integrationid (by integrationId)
     * @param request the Flows and the passphrase
     * @return the ResponseEntity with status 200 and the zip, or status 400 (Bad Request) with the reason as text
     */
    @Operation(summary = "Export flows as a zip to import into Fluxygen")
    @PostMapping(
        path = "/environment/{integrationid}/fluxygen-export",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = "application/zip"
    )
    public ResponseEntity<byte[]> exportForFluxygen(
        @PathVariable(value = "integrationid") Long integrationid,
        @RequestBody FluxygenExportRequest request
    ) {
        try {
            byte[] zip = fluxygenExport.zip(integrationid, request.flowIds(), request.passphrase());
            String fileName = fluxygenExport.fileName(LocalDate.now().toString());
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(fileName).build().toString())
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .body(zip);
        } catch (IllegalArgumentException e) {
            return textResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Export for Fluxygen of integration {} failed: {}", integrationid, e.getMessage());
            return textResponse(HttpStatus.INTERNAL_SERVER_ERROR, "The export for Fluxygen failed: " + e.getMessage());
        }
    }

    private static ResponseEntity<byte[]> textResponse(HttpStatus status, String message) {
        return ResponseEntity.status(status).contentType(MediaType.TEXT_PLAIN).body(String.valueOf(message).getBytes(StandardCharsets.UTF_8));
    }

}
