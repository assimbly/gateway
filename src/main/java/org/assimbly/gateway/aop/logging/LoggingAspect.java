package org.assimbly.gateway.aop.logging;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.web.ErrorResponse;
import tech.jhipster.config.JHipsterConstants;

import java.util.Arrays;

/**
 * Aspect for logging execution of service and repository Spring components.
 * By default, it only runs with the "dev" profile.
 */
@Aspect
public class LoggingAspect {

    private final Environment env;

    public LoggingAspect(Environment env) {
        this.env = env;
    }

    /**
     * Pointcut that matches all repositories, services and Web REST endpoints.
     */
    @Pointcut(
        "within(@org.springframework.stereotype.Repository *)" +
        " || within(@org.springframework.stereotype.Service *)" +
        " || within(@org.springframework.web.bind.annotation.RestController *)"
    )
    public void springBeanPointcut() {
        // Method is empty as this is just a Pointcut, the implementations are in the advices.
    }

    /**
     * Pointcut that matches all Spring beans in the application's main packages.
     */
    @Pointcut(
        "within(org.assimbly.gateway.repository..*)" +
        " || within(org.assimbly.gateway.service..*)" +
        " || within(org.assimbly.gateway.web.rest..*)"
    )
    public void applicationPackagePointcut() {
        // Method is empty as this is just a Pointcut, the implementations are in the advices.
    }

    /**
     * Pointcut that matches the calls the UI polls: the tail of the log, a Flow's alerts and stats, and a Flow by
     * its name (the Tutorials panel checks whether a Flow exists). Logging the tail would write it back into the
     * log, so every refresh of the log viewer would repeat its lines; the other polls would fill the log with the
     * same few lines every few seconds.
     */
    @Pointcut(
        "execution(* org.assimbly.gateway.web.rest..*.getLog(..))" +
        " || execution(* org.assimbly.gateway.web.rest..*.getFlowAlerts(..))" +
        " || execution(* org.assimbly.gateway.service..FlowAlertLogService.page(..))" +
        " || execution(* org.assimbly.gateway.web.rest..*.get*Stats(..))" +
        " || execution(* org.assimbly.gateway.web.rest..*.getFlowByName(..))" +
        " || execution(* org.assimbly.gateway.service..FlowService*.findByName(..))"
    )
    public void pollingPointcut() {
        // Method is empty as this is just a Pointcut, the implementations are in the advices.
    }

    /**
     * Retrieves the {@link Logger} associated to the given {@link JoinPoint}.
     *
     * @param joinPoint join point we want the logger for.
     * @return {@link Logger} associated to the given {@link JoinPoint}.
     */
    private Logger logger(JoinPoint joinPoint) {
        return LoggerFactory.getLogger(joinPoint.getSignature().getDeclaringTypeName());
    }

    /**
     * Advice that logs methods throwing exceptions. A client error, such as a 404 for a Flow that isn't there, is
     * the answer to the request rather than a fault of the Gateway, so it's logged at debug without a stack trace.
     *
     * @param joinPoint join point for advice.
     * @param e exception.
     */
    @AfterThrowing(pointcut = "applicationPackagePointcut() && springBeanPointcut()", throwing = "e")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable e) {
        if (e instanceof ErrorResponse response && response.getStatusCode().is4xxClientError()) {
            logger(joinPoint).debug("{}() answered {}", joinPoint.getSignature().getName(), response.getStatusCode());
        } else if (env.acceptsProfiles(Profiles.of(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT))) {
            logger(joinPoint)
                .error(
                    "Exception in {}() with cause = '{}' and exception = '{}'",
                    joinPoint.getSignature().getName(),
                    e.getCause() != null ? e.getCause() : "NULL",
                    e.getMessage(),
                    e
                );
        } else {
            logger(joinPoint)
                .error(
                    "Exception in {}() with cause = {}",
                    joinPoint.getSignature().getName(),
                    e.getCause() != null ? String.valueOf(e.getCause()) : "NULL"
                );
        }
    }

    /**
     * Advice that logs when a method is entered and exited.
     *
     * @param joinPoint join point for advice.
     * @return result.
     * @throws Throwable throws {@link IllegalArgumentException}.
     */
    @Around("applicationPackagePointcut() && springBeanPointcut() && !pollingPointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        Logger log = logger(joinPoint);
        if (log.isDebugEnabled()) {
            log.debug("Enter: {}() with argument[s] = {}", joinPoint.getSignature().getName(), Arrays.toString(joinPoint.getArgs()));
        }
        try {
            Object result = joinPoint.proceed();
            if (log.isDebugEnabled()) {
                log.debug("Exit: {}() with result = {}", joinPoint.getSignature().getName(), result);
            }
            return result;
        } catch (IllegalArgumentException e) {
            log.error("Illegal argument: {} in {}()", Arrays.toString(joinPoint.getArgs()), joinPoint.getSignature().getName());
            throw e;
        }
    }
}
