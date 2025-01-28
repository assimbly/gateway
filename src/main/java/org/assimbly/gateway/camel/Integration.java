package org.assimbly.gateway.camel;

import jakarta.annotation.PostConstruct;
import org.apache.camel.CamelContext;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.CustomObjectMapperConfig;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.integrationrest.IntegrationRuntime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * REST controller for managing flow.
 */
@Lazy(false)
@Component
public class Integration {

    private final Logger log = LoggerFactory.getLogger(Integration.class);

    @Autowired
    EncryptionProperties encryptionProperties;
    private final ApplicationProperties applicationProperties;

    private org.assimbly.integration.Integration integration;

    private final IntegrationRuntime integrationRuntime;

    public Integration(ApplicationProperties applicationProperties, IntegrationRuntime integrationRuntime) {
        this.applicationProperties = applicationProperties;
        this.integrationRuntime = integrationRuntime;
    }
    @PostConstruct
    public void init() throws Exception {
        log.debug("Start runtime");
        initIntegration();
    }


    public CamelContext initIntegration() throws Exception {

        ApplicationProperties.Gateway gateway = applicationProperties.getGateway();
        ApplicationProperties.DeployDirectory deployDirectory = applicationProperties.getDeployDirectory();

        boolean isDebuggging = gateway.getDebugging();
        boolean deployOnStart = deployDirectory.getDeployOnStart();
        boolean deployOnChange = deployDirectory.getDeployOnChange();

        integrationRuntime.setIntegration(encryptionProperties.getProperties());

        integrationRuntime.initIntegration();

        integration = integrationRuntime.getIntegration();

        integration.setDebugging(isDebuggging);
        integration.setDeployDirectory(deployOnStart,deployOnChange);

        CamelContext camelContext = integration.getContext();

        CustomObjectMapperConfig.addCustomObjectMapper(camelContext);

        return camelContext;
    }

}
