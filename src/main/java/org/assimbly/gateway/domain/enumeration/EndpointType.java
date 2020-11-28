package org.assimbly.gateway.domain.enumeration;

/**
 * The EndpointType enumeration.
 */
public enum EndpointType {
    FROM("from"), TO("to"), ERROR("error"), RESPONSE("response"), WIRETAP("wiretap");
    
    private String endpoint;
    
    EndpointType(String endpoint) {
        this.endpoint = endpoint;
    }
 
    public String getEndpoint() {
        return endpoint;
    }

}
