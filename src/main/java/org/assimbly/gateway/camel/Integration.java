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

    private final IntegrationRuntime integrationRuntime;

    public Integration(ApplicationProperties applicationProperties, IntegrationRuntime integrationRuntime) {
        this.integrationRuntime = integrationRuntime;
    }
    @PostConstruct
    public void init() throws Exception {
        log.debug("Start runtime");
        initIntegration();
    }


    public CamelContext initIntegration() throws Exception {

        integrationRuntime.setIntegration(encryptionProperties.getProperties());

        integrationRuntime.initIntegration();

        org.assimbly.integration.Integration runtime = integrationRuntime.getIntegration();

        CamelContext camelContext = runtime.getContext();

        CustomObjectMapperConfig.addCustomObjectMapper(camelContext);

        return camelContext;
    }

}
