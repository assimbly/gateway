package org.assimbly.gateway.event;

import org.apache.camel.impl.event.ExchangeFailedEvent;
import org.apache.camel.impl.event.ExchangeFailureHandledEvent;
import org.apache.camel.spi.CamelEvent;
import org.apache.camel.support.EventNotifierSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

// This class listens to failure events in camel exchanges (routes) and send them to the websocket topic: topic/alert
// Check the following page for all EventObject instances of Camel: http://camel.apache.org/maven/current/camel-core/apidocs/org/apache/camel/management/event/package-summary.html

@Component
public class FailureListener extends EventNotifierSupport {

   private final Logger log = LoggerFactory.getLogger(FailureListener.class);

   @Autowired
   private SimpMessageSendingOperations messagingTemplate;

   private String flowId;

    public boolean isEnabled(CamelEvent event) {

      //only notify on failures
      if (event instanceof ExchangeFailureHandledEvent  || event instanceof ExchangeFailedEvent) {
		     return true;
	  }

	  return false;

    }

    protected void doStart() throws Exception {
        // noop
    }

    protected void doStop() throws Exception {
        // noop
    }

	@Override
	public void notify(CamelEvent event) throws Exception {

		if (event instanceof ExchangeFailureHandledEvent) {

	    	ExchangeFailureHandledEvent exchangeFailedEvent = (ExchangeFailureHandledEvent) event;
	        flowId = exchangeFailedEvent.getExchange().getFromRouteId();

			int flowIdPart = flowId.indexOf("-"); //this finds the first occurrence of "."

			if (flowIdPart != -1)
			{
				flowId= flowId.substring(0 , flowIdPart); //this will give abc
			}

	        if(this.messagingTemplate!=null) {
	        	this.messagingTemplate.convertAndSend("/topic/" + flowId + "/alert","alert:" + flowId);
	        }else {
	            log.warn("Can't send alert to websocket. messagingTemplate=null");
	        }

		}else if (event instanceof ExchangeFailedEvent) {

	    	ExchangeFailedEvent exchangeFailedEvent = (ExchangeFailedEvent) event;
	        flowId = exchangeFailedEvent.getExchange().getFromRouteId();

			int flowIdPart = flowId.indexOf("-"); //this finds the first occurrence of "."

			if (flowIdPart != -1)
			{
				flowId= flowId.substring(0 , flowIdPart); //this will give abc
			}

	        if(this.messagingTemplate!=null) {
                log.warn("Sending alert to " + flowId);
	        	this.messagingTemplate.convertAndSend("/topic/" + flowId + "/alert","alert:" +  flowId);
	        }else {
	            log.warn("Can't send alert to websocket. messagingTemplate=null");
	        }
	    }
	}
}
