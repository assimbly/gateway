package org.assimbly.gateway.config.scheduling;

import org.assimbly.gateway.config.environment.DBConfiguration;
import org.assimbly.gateway.web.rest.gateway.GatewayResource;
import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Component
public class ExportConfigJob implements Job {

    private final Logger log = LoggerFactory.getLogger(GatewayResource.class);

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
            Files.write(Paths.get(context.getScheduler().getContext().get("url") + "" + LocalDateTime.now() + ".xml"), ((DBConfiguration) context.getScheduler().getContext().get("database")).convertDBToConfiguration((long) (int) context.getScheduler().getContext().get("gatewayid"), "xml",false).getBytes());
        } catch (Exception e) {
            log.info("Exception in ExportConfigJob: " + e);
        }
    }
}

