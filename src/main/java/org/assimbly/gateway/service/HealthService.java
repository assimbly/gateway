package org.assimbly.gateway.service;

/**
 * Service Interface for managing Integration.
 */
public interface HealthService {

    /**
     * Convert double size to long Kb
     *
     * @param var1 the value to convert
     * @return Kb
     */
    long convertSizeToKb(double var1);

    /**
     * Invoke system method
     *
     * @param methodName to invoke
     * @return object with method call response
     */
    Object invokeMethod(String methodName);

}
