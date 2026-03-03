package org.assimbly.gateway.config;

import tools.jackson.databind.ObjectMapper;
import org.apache.camel.CamelContext;
import org.apache.camel.spi.Registry;

public class CustomObjectMapperConfig {

    public static void addCustomObjectMapper(CamelContext camelContext) {
        ObjectMapper objectMapper = new ObjectMapper();

        Registry registry = camelContext.getRegistry();
        registry.bind("objectMapper", objectMapper);
    }
}
