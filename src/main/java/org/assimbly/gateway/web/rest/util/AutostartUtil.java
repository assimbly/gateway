package org.assimbly.gateway.web.rest.util;

import java.util.List;

import org.assimbly.gateway.config.flows.AssimblyDBConfiguration;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * REST controller for managing flow.
 */
public final class AutostartUtil {

    private final Logger log = LoggerFactory.getLogger(AutostartUtil.class);

	@Autowired
	private AssimblyDBConfiguration assimblyDBConfiguration;
    
	@Autowired
	private FlowRepository flowRepository;
    
    
    public List<Flow> getFlows() {
    	return flowRepository.findAll();
    }
    
	public String getFlowConfiguration(Long id) throws Exception {
		String configuration = assimblyDBConfiguration.convertDBToXMLFlowConfiguration(id);
		return configuration;
	}
	
}