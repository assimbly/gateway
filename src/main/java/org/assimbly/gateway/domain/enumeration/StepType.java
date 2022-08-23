package org.assimbly.gateway.domain.enumeration;

/**
 * The StepType enumeration.
 */
public enum StepType {
    FROM("from"),
	TO("to"),
	ERROR("error"),
	RESPONSE("response"),
	SOURCE("source"),
	ACTION("action"),
	ROUTER("router"),
	SINK("sink"),
	GET("get"),
	POST("put"),
	PATCH("patch"),
	PUT("put"),
	DELETE("delete"),
	ROUTE("route"),
	CONNECTION("connection");

    private final String step;

    StepType(String step) {
        this.step = step;
    }

    public String getStep() {
        return step;
    }

}
