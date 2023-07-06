package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.HealthCheckService;
import org.assimbly.gateway.service.IntegrationService;
import org.assimbly.gateway.service.dto.IntegrationDTO;
import org.assimbly.gateway.service.mapper.IntegrationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Integration.
 */
@Service
@Transactional
public class HealthCheckServiceImpl implements HealthCheckService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    private final OperatingSystemMXBean operatingSystemMXBean = ManagementFactory.getOperatingSystemMXBean();

    public HealthCheckServiceImpl() {
        //
    }

    /**
     * Convert double size to long Kb
     *
     * @param size the value to convert
     * @return Kb
     */
    @Override
    public long convertSizeToKb(double size) {
        return (long) (size / 1024);
    }

    /**
     * Invoke system method
     *
     * @param methodName to invoke
     * @return object with method call response
     */
    @Override
    public Object invokeMethod(String methodName) {
        try {
            Class<?> unixOS = Class.forName("com.sun.management.UnixOperatingSystemMXBean");

            if (unixOS.isInstance(operatingSystemMXBean))
                return unixOS.getMethod(methodName).invoke(operatingSystemMXBean);

        } catch (Throwable ignored) { }

        return "Unknown";
    }
}
