package org.assimbly.gateway.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.camel.CamelContext;
import org.apache.camel.spi.Registry;

public class CustomObjectMapperConfig {

    public static void addCustomObjectMapper(CamelContext camelContext) {
        ObjectMapper objectMapper = new ObjectMapper();

        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

        Registry registry = camelContext.getRegistry();
        registry.bind("objectMapper", objectMapper);
    }
}
