package org.assimbly.gateway.config.scheduling;

import org.assimbly.gateway.domain.Gateway;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class ExportConfigJob implements Job {
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        
        // EXPORT CONFIG TO URL
    }
}
