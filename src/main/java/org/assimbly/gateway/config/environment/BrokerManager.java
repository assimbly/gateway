package org.assimbly.gateway.config.environment;

import org.assimbly.connector.service.Broker;
import org.assimbly.connector.service.BrokerArtemis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BrokerManager {
	
    private final Logger log = LoggerFactory.getLogger(BrokerManager.class);
	
	private String brokerStatus;

	private String artemisStatus;

	private Broker broker = new Broker();
	
	private BrokerArtemis artemis = new BrokerArtemis();
	
	public void stop(String gatewayType) {
		
	      try {
			brokerStatus = broker.status();
			artemisStatus = artemis.status();

			if (gatewayType.equals("BROKER")) {	            
       			if(brokerStatus.equals("started")) {
       				log.info("Stopping embedded ActiveMQ broker");
       				broker.stop();
       			}
	        }else if (gatewayType.equals("ARTEMIS")) {
       			if(artemisStatus.equals("started")) {
    	            log.info("Stopping embedded ActiveMQ Artemis broker");
       				artemis.stop();
       			}
	        }

			
        } catch (Exception e1) {
			e1.printStackTrace();
		}
		
	}


	public void start(String gatewayType) {
		
      try {    	  

			brokerStatus = broker.status();
			artemisStatus = artemis.status();

			if (gatewayType.equals("BROKER")) {
       			if(brokerStatus.equals("stopped")) {
	                log.info("Starting embedded ActiveMQ broker");
	       			broker.start();
       			}
	        }else if (gatewayType.equals("ARTEMIS")) {	            
       			if(artemisStatus.equals("stopped")) {
       				log.info("Starting embedded ActiveMQ Artemis broker");
       				artemis.start();
       			}
	        }

			
        } catch (Exception e1) {
			e1.printStackTrace();
		}
		
	}	

}
