package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.ApplicationProperties.Documentation;
import org.assimbly.gateway.config.ApplicationProperties.Gateway;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Resource to return application documentation links.
 */
@RestController
@RequestMapping("/api")
public class ApplicationInfoResource {

    private final ApplicationProperties applicationProperties;

    public ApplicationInfoResource(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @GetMapping("/wiki-url")
    public String getWikiLink() {
        Documentation doc = applicationProperties.getDocumentation();
        return doc.getUrl();
    }

    @GetMapping("/camel-url")
    public String getCamelLink() {
        Documentation doc = applicationProperties.getDocumentation();
        return doc.getCamelUrl();
    }

    @GetMapping("/gateway-name")
    public String getGatewayName() {
        Gateway gatway = applicationProperties.getGateway();
        return gatway.getName();
    }
}