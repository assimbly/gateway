package org.assimbly.gateway.event;

import java.util.EventObject;

import org.apache.camel.management.event.ExchangeFailedEvent;
import org.apache.camel.management.event.ExchangeFailureHandledEvent;
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
   
	public void notify(EventObject eventObject) throws Exception {

		if (eventObject instanceof ExchangeFailureHandledEvent) {

	    	ExchangeFailureHandledEvent exchangeFailedEvent = (ExchangeFailureHandledEvent) eventObject;
	        flowId = exchangeFailedEvent.getExchange().getFromRouteId();

	        if(this.messagingTemplate!=null) {
	        	this.messagingTemplate.convertAndSend("/topic/" + flowId + "/alert","alert:" + flowId);
	        }else {
	            log.warn("Can't send alert to websocket. messagingTemplate=null");
	        }

		}else if (eventObject instanceof ExchangeFailedEvent) {

	    	ExchangeFailedEvent exchangeFailedEvent = (ExchangeFailedEvent) eventObject;
	        flowId = exchangeFailedEvent.getExchange().getFromRouteId();

	        if(this.messagingTemplate!=null) {
	        	this.messagingTemplate.convertAndSend("/topic/" + flowId + "/alert","alert:" +  flowId);
	        }else {
	            log.warn("Can't send alert to websocket. messagingTemplate=null");
	        }
	    }    
	}
	
    public boolean isEnabled(EventObject event) {
        return true;
    }

    protected void doStart() throws Exception {
        // noop
    }

    protected void doStop() throws Exception {
        // noop
    }

}
