package org.assimbly.gateway.config.scheduling;

import org.assimbly.gateway.config.environment.DBConfiguration;
import org.assimbly.gateway.web.rest.GatewayResource;
import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

public class ExportConfigJob implements Job {
    @Autowired
    private DBConfiguration DBConfiguration;
    private final Logger log = LoggerFactory.getLogger(GatewayResource.class);
    private String configuration;
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
            int gatewayid = (int) context.getScheduler().getContext().get("gatewayid");
            long longValue = Long.valueOf(gatewayid);
            configuration = DBConfiguration.convertDBToConfiguration(longValue, "json",false);
        } catch (Exception e) {
            log.info(e.toString() + " this");
        }
    }
}

