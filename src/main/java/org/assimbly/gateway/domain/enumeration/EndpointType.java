package org.assimbly.gateway.domain.enumeration;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The EndpointType enumeration.
 */
public enum EndpointType {
	ACTIVEMQ("ACTIVEMQ"),
	AMQP("AMQP"),
	AS2("AS2"),
	@JsonProperty("AWS-S3")
	AWSS3("AWS-S3"),
	DIRECT("DIRECT"),
	ELASTICSEARCH("ELASTICSEARCH"),
	FILE("FILE"),
	FTP("FTP"),
	FTPS("FTPS"),
	HTTP("HTTP"),
	HTTPS("HTTPS"),
	IMAP("IMAP"),
	IMAPS("IMAPS"),
	JETTY("JETTY"),
	NETTY4("NETTY4"),
	LOG("LOG"),	
	KAFKA("KAFKA"),
	RABBITMQ("RABBITMQ"),
	REST("REST"),
	SCHEDULER("SCHEDULER"),
	SJMS("SJMS"),
	SLACK("SLACK"),
	SMTP("SMTP"),
	SMTPS3("SMTPS3"),
	SQL("SQL"),
	SFTP("SFTP"),
	SONICMQ("SONICMQ"),
	STREAM("STREAM"),
	TELEGRAM("TELEGRAM"),
	TIMER("TIMER"),
	VM("VM"),
	WASTEBIN("WASTEBIN"),
	WEBSOCKET("WEBSOCKET");
 
    private String endpoint;
 
    EndpointType(String endpoint) {
        this.endpoint = endpoint;
    }
 
    public String getEndpoint() {
        return endpoint;
    }
	
	
}
