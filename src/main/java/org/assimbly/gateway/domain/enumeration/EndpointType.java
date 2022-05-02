package org.assimbly.gateway.domain.enumeration;

/**
 * The EndpointType enumeration.
 */
public enum EndpointType {
    FROM("from"),
	TO("to"),
	ERROR("error"),
	RESPONSE("response"),
	GET("get"),
	POST("put"),
	PATCH("patch"),
	PUT("put"),
	DELETE("delete"),
	ROUTE("route"),
	SERVICE("SERVICE");

    private final String endpoint;

    EndpointType(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getEndpoint() {
        return endpoint;
    }

}
