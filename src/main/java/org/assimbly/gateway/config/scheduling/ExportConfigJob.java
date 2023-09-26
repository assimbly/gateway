package org.assimbly.gateway.config.scheduling;

import org.assimbly.gateway.config.exporting.Export;
import org.assimbly.gateway.web.rest.gateway.IntegrationResource;
import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.time.LocalDateTime;

@Component
public class ExportConfigJob implements Job {

    private final Logger log = LoggerFactory.getLogger(IntegrationResource.class);

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
			Object url = context.getScheduler().getContext().get("url");
			Long integrationId = (long) (int) context.getScheduler().getContext().get("integrationId");

			Path path = Paths.get(url + "" + LocalDateTime.now() + ".xml");
			String configuration = ((Export) context.getScheduler().getContext().get("database")).convertDBToConfiguration(integrationId, "xml",false);

            Files.write(path, configuration.getBytes());
        } catch (Exception e) {
            log.info("Exception in ExportConfigJob: " + e);
        }
    }
}
