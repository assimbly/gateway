package org.assimbly.gateway.web.rest.gateway;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.ApplicationProperties.Documentation;
import org.assimbly.gateway.config.ApplicationProperties.Gateway;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Resource to return application documentation links.
 */
@Tag(name = "Application info", description = "Information about the gateway")
@RestController
@RequestMapping("/api")
public class ApplicationInfoResource {

    private final ApplicationProperties applicationProperties;

    public ApplicationInfoResource(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Operation(summary = "Get the wiki URL")
    @GetMapping("/wiki-url")
    public String getWikiLink() {
        Documentation doc = applicationProperties.getDocumentation();
        return doc.getUrl();
    }

    @Operation(summary = "Get the Camel documentation URL")
    @GetMapping("/camel-url")
    public String getCamelLink() {
        Documentation doc = applicationProperties.getDocumentation();
        return doc.getCamelUrl();
    }

    @Operation(summary = "Get the gateway name")
    @GetMapping("/gateway-name")
    public String getGatewayName() {
        Gateway gateway = applicationProperties.getGateway();
        return gateway.getName();
    }

    @Operation(summary = "Get the gateway base directory")
    @GetMapping("/gateway-base-directory")
    public String getGatewayBaseDirectory() {
        Gateway gateway = applicationProperties.getGateway();
        return gateway.getBaseDirectory();
    }


}
