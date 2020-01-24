package org.assimbly.gateway.config.environment;



import org.assimbly.connector.Broker;
import org.assimbly.connector.service.ActiveMQArtemis;
import org.assimbly.connector.service.ActiveMQClassic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BrokerManager {
	
    private final Logger log = LoggerFactory.getLogger(BrokerManager.class);
	
    private Broker broker = new ActiveMQClassic();
	
	private Broker artemis = new ActiveMQArtemis();
	
	private String status;

	private String configuration;

	private String result;

	private String info;

	
	public String getStatus(String brokerType) {
		
	   status = "stopped";

	   try {

			if (brokerType.equals("classic")) {	            
				status = broker.status();
	        }else if (brokerType.equals("artemis")) {
				status = artemis.status();
	        }

      } catch (Exception e1) {
			e1.printStackTrace();
		}
	      
	      return status;     
		
	}


	public String getInfo(String brokerType) {
		
		   info = "no info";

		   try {

				if (brokerType.equals("classic")) {	            
					info = broker.info();
		        }else if (brokerType.equals("artemis")) {
					info = artemis.info();
		        }

	      } catch (Exception e1) {
				e1.printStackTrace();
			}
		      
		      return info;     
			
		}
	
	public String getConfiguration(String brokerType) {
		
		   try {

				if (brokerType.equals("classic")) {	            
					configuration = broker.getFileConfiguration();
		        }else if (brokerType.equals("artemis")) {
					configuration = artemis.getFileConfiguration();
		        }

	      } catch (Exception e1) {
				e1.printStackTrace();
			}
		      
		  return configuration;     
			
	}

	public String setConfiguration(String brokerType, String brokerConfigurationType, String brokerConfiguration) {
	   	
		   try {

				if (brokerType.equals("classic")) {	            
					result = broker.setFileConfiguration(brokerConfiguration);
		        }else if (brokerType.equals("artemis")) {
					result = artemis.setFileConfiguration(brokerConfiguration);
		        }

	      } catch (Exception e1) {
				e1.printStackTrace();
			}
		      
		  return result;     
			
	}
	
	
	public String start(String brokerType, String brokerConfigurationType) {
		
		  try {
	    	
			log.info("Current ActiveMQ broker status: " + status + " (type=" + brokerType + ",configurationtype=" + brokerConfigurationType + ")");

			status = getStatus(brokerType);  
					
			if(status.equals("stopped")) {
				if (brokerType.equals("classic") && brokerConfigurationType.equals("file")) {	            
	   				log.info("Starting ActiveMQ broker");
	   				status = broker.start();
		        }else if (brokerType.equals("classic") && brokerConfigurationType.equals("embedded")) {
		        	log.info("Starting ActiveMQ broker");
		        	status = broker.startEmbedded();
		        }else if (brokerType.equals("artemis") && brokerConfigurationType.equals("file")) {
		        	log.info("Starting ActiveMQ Artemis broker");
		        	status = artemis.start();
		        }else if (brokerType.equals("artemis") && brokerConfigurationType.equals("embedded")) {
		        	log.info("Starting ActiveMQ Artemis broker");
		        	status = artemis.startEmbedded();
		        }
			}

				
	      } catch (Exception e1) {
				e1.printStackTrace();
	      }
		      
		  return status;
			
		}	

		
		public String restart(String brokerType, String brokerConfigurationType) {
			
			  try {

					status = getStatus(brokerType);
					
					if(status.equals("stopped")) {
						if (brokerType.equals("classic") && brokerConfigurationType.equals("file")) {	            
			   				log.info("Starting ActiveMQ broker");
			   				status = broker.restart();
				        }else if (brokerType.equals("classic") && brokerConfigurationType.equals("embedded")) {
				        	log.info("Starting ActiveMQ broker");
				        	status = broker.restartEmbedded();
				        }else if (brokerType.equals("artemis") && brokerConfigurationType.equals("file")) {
				        	log.info("Starting ActiveMQ Artemis broker");
				        	status = artemis.start();
				        }else if (brokerType.equals("artemis") && brokerConfigurationType.equals("embedded")) {
				        	log.info("Starting ActiveMQ Artemis broker");
				        	status = artemis.restartEmbedded();
				        }
					}

						
			      } catch (Exception e1) {
						e1.printStackTrace();
			      }		
			  
			  return status;
	}

		
	public String stop(String brokerType) {
		
	      try {

			status = getStatus(brokerType);
				
			if(status.equals("started")) {
				if (brokerType.equals("classic")) {	            
	   				log.info("Stopping ActiveMQ broker");
	   				status = broker.stop();
		        }else if (brokerType.equals("artemis")) {
    	            log.info("Stopping ActiveMQ Artemis broker");
    	            status = artemis.stop();
		        }

   			}

			
        } catch (Exception e1) {
			e1.printStackTrace();
		}
	      
	    return status;
		
	}


}
