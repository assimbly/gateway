package org.assimbly.gateway.config.environment;

import org.assimbly.broker.Broker;
import org.assimbly.broker.ActiveMQArtemis;
import org.assimbly.broker.ActiveMQClassic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public class BrokerManager {

    private final Logger log = LoggerFactory.getLogger(BrokerManager.class);

    private Broker broker;

    private Broker classic = new ActiveMQClassic();

	private Broker artemis = new ActiveMQArtemis();

	private String status;


	//Broker configuration
    public String getConfiguration(String brokerType) throws Exception {
        broker = getBroker(brokerType);
        return broker.getFileConfiguration();
    }

    public String setConfiguration(String brokerType, String brokerConfigurationType, String brokerConfiguration) throws Exception {
        broker = getBroker(brokerType);
        return broker.setFileConfiguration(brokerConfiguration);
    }

    //Broker manage
    public String start(String brokerType, String brokerConfigurationType) throws Exception {

        log.info("Current ActiveMQ broker status: " + status + " (type=" + brokerType + ",configurationtype=" + brokerConfigurationType + ")");

        broker = getBroker(brokerType);
        status = getStatus(brokerType);

        if(status.equals("stopped")) {
            if (brokerConfigurationType.equals("file")) {
                log.info("Starting ActiveMQ broker");
                status = broker.start();
            }else if (brokerConfigurationType.equals("embedded")) {
                log.info("Starting ActiveMQ broker");
                status = broker.startEmbedded();
            }
        }

        return status;

    }


    public String restart(String brokerType, String brokerConfigurationType) throws Exception {

        broker = getBroker(brokerType);
        status = getStatus(brokerType);

        if(status.equals("stopped")) {
            if (brokerConfigurationType.equals("file")) {
                log.info("Starting ActiveMQ broker");
                status = broker.restart();
            }else if (brokerConfigurationType.equals("embedded")) {
                log.info("Starting ActiveMQ broker");
                status = broker.restartEmbedded();
            }
        }

        return status;
    }


    public String stop(String brokerType) throws Exception {

        broker = getBroker(brokerType);
        status = getStatus(brokerType);

        if(status.equals("started")) {
             log.info("Stopping ActiveMQ broker");
             status = broker.stop();
        }

        return status;

    }

    public String getStatus(String brokerType) throws Exception {
        broker = getBroker(brokerType);
        return broker.status();
    }

    public String getInfo(String brokerType) throws Exception {
        broker = getBroker(brokerType);
        return broker.info();
    }

    public String getConnections(String brokerType) throws Exception {
        broker = getBroker(brokerType);
        return broker.getConnections();
    }

    public String getConsumers(String brokerType) throws Exception {
        broker = getBroker(brokerType);
        return broker.getConsumers();
    }

    //Queue manage
    public String createQueue(String brokerType, String queueName) throws Exception {
        broker = getBroker(brokerType);
        return broker.createQueue(queueName);
    }

    public String deleteQueue(String brokerType, String queueName) throws Exception {
        broker = getBroker(brokerType);
        return broker.deleteQueue(queueName);
    }

    public String getQueue(String brokerType, String queueName) throws Exception {
        broker = getBroker(brokerType);
        return broker.getQueue(queueName);
    }

    public String getQueues(String brokerType) throws Exception {
        broker = getBroker(brokerType);
        return broker.getQueues();
    }

    public String clearQueue(String brokerType, String queueName) throws Exception {
        broker = getBroker(brokerType);
        return broker.clearQueue(queueName);
    }

    public String clearQueues(String brokerType) throws Exception {
        broker = getBroker(brokerType);
        return broker.clearQueues();
    }

    //manage messages
    public String listMessages(String brokerType, String endpointName, String filter) throws Exception{
        broker = getBroker(brokerType);
        return broker.listMessages(endpointName, filter);
    }

    public String sendMessage(String brokerType, String endpointName, Map<String,String> messageHeaders, String messageBody) throws Exception{
        broker = getBroker(brokerType);
        return broker.sendMessage(endpointName, messageHeaders, messageBody);
    }

    public String browseMessage(String brokerType, String endpointName, String messageId) throws Exception{
        broker = getBroker(brokerType);
        return broker.browseMessage(endpointName, messageId);
    }

    public String browseMessages(String brokerType, String endpointName) throws Exception{
        broker = getBroker(brokerType);
        return broker.browseMessages(endpointName);
    }

    public String removeMessage(String brokerType, String endpointName, int messageId) throws Exception{
        broker = getBroker(brokerType);
        return broker.removeMessage(endpointName, messageId);
    }

    public String removeMessages(String brokerType, String endpointName) throws Exception{
        broker = getBroker(brokerType);
        return broker.removeMessages(endpointName);
    }

    public String moveMessage(String brokerType, String sourceQueueName, String targetQueueName, String messageId) throws Exception{
        broker = getBroker(brokerType);
        return broker.moveMessage(sourceQueueName, targetQueueName, messageId);
    }

    public String moveMessages(String brokerType, String sourceQueueName, String targetQueueName) throws Exception{
        broker = getBroker(brokerType);
        return broker.moveMessages(sourceQueueName, targetQueueName);
    }





    //private methods
	private Broker getBroker(String brokerType) throws Exception {
        if (brokerType.equalsIgnoreCase("classic")) {
            return classic;
        }else if (brokerType.equalsIgnoreCase("artemis")) {
            return artemis;
        }else{
            throw new Exception("Unknown brokerType: valid values are 'classic' or 'artemis'");
        }
    }
}
