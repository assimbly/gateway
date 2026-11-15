package org.assimbly.gateway.camel;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import org.apache.camel.CamelContext;
import org.assimbly.gateway.config.CustomObjectMapperConfig;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.config.security.BeforeRuntimeStart;
import org.assimbly.integrationrest.IntegrationRuntime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * REST controller for managing flow.
 */
@Lazy(false)
@Component
public class Integration implements ApplicationRunner {

    private final Logger log = LoggerFactory.getLogger(Integration.class);

    @Autowired
    EncryptionProperties encryptionProperties;

    private final IntegrationRuntime integrationRuntime;

    private CompletableFuture<Void> startupFuture;

    public Integration(IntegrationRuntime integrationRuntime, ObjectProvider<BeforeRuntimeStart> beforeRuntimeStart) {
        this.integrationRuntime = integrationRuntime;
        // Sets them up, and so does their work, before the runtime starts
        beforeRuntimeStart
            .orderedStream()
            .forEach(work -> log.debug("Done before the runtime starts: {}", work.getClass().getSimpleName()));
    }

    @PostConstruct
    public void init() {
        log.debug("Start runtime");
        CompletableFuture<Void> future = new CompletableFuture<>();
        this.startupFuture = future;
        Thread.ofPlatform()
            .name("camel-runtime-init")
            .start(() -> {
                try {
                    initIntegration();
                    future.complete(null);
                } catch (Throwable t) {
                    future.completeExceptionally(t);
                }
            });
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (startupFuture != null) {
            try {
                startupFuture.join();
            } catch (CompletionException e) {
                if (e.getCause() instanceof Exception ex) {
                    throw ex;
                }
                throw e;
            }
        }
    }

    public void initIntegration() throws Exception {
        integrationRuntime.setIntegration(encryptionProperties.getProperties());

        integrationRuntime.initIntegration();

        org.assimbly.integration.Integration runtime = integrationRuntime.getIntegration();

        CamelContext camelContext = runtime.getContext();

        CustomObjectMapperConfig.addCustomObjectMapper(camelContext);
    }
}
