package org.assimbly.gateway.web.rest.aspect;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.assimbly.gateway.aop.logging.LoggingAspect;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.http.HttpStatus;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * In dev, REST calls are logged with their result, except what the UI polls: the log tail, which would write the log into
 * the log again, and a Flow's alerts, stats and lookup by name, which would fill the log. A client error is an answer,
 * not an error of the Gateway.
 */
class LoggingAspectTest {

    private final ListAppender<ILoggingEvent> appender = new ListAppender<>();
    private final Logger logger = (Logger) LoggerFactory.getLogger(LogEndpoints.class);
    private LogEndpoints endpoints;

    @BeforeEach
    void proxyEndpoints() {
        appender.start();
        logger.addAppender(appender);
        logger.setLevel(Level.DEBUG);

        AspectJProxyFactory factory = new AspectJProxyFactory(new LogEndpoints());
        factory.setProxyTargetClass(true);
        factory.addAspect(new LoggingAspect(new MockEnvironment()));
        endpoints = factory.getProxy();
    }

    @AfterEach
    void detachAppender() {
        logger.detachAppender(appender);
        logger.setLevel(null);
    }

    @Test
    void logTailIsNotLogged() {
        endpoints.getLog();

        assertThat(messages()).isEmpty();
    }

    @Test
    void polledAlertsAndStatsAreNotLogged() {
        endpoints.getFlowAlerts();
        endpoints.getJvmStats();

        assertThat(messages()).isEmpty();
    }

    @Test
    void polledLookupByNameIsNotLogged() {
        endpoints.getFlowByName();

        assertThat(messages()).isEmpty();
    }

    @Test
    void clientErrorIsNotLoggedAsError() {
        assertThatThrownBy(endpoints::getMissingFlow).isInstanceOf(ResponseStatusException.class);

        assertThat(appender.list).noneMatch(event -> event.getLevel() == Level.ERROR);
        assertThat(messages()).contains("getMissingFlow() answered 404 NOT_FOUND");
    }

    @Test
    void serverErrorIsLoggedAsError() {
        assertThatThrownBy(endpoints::getBrokenFlow).isInstanceOf(IllegalStateException.class);

        assertThat(appender.list).anyMatch(event -> event.getLevel() == Level.ERROR);
    }

    @Test
    void otherCallsAreLoggedWithTheirResult() {
        endpoints.getFlow();

        assertThat(messages()).anyMatch(message -> message.startsWith("Exit: getFlow() with result = flow"));
    }

    private List<String> messages() {
        return appender.list.stream().map(ILoggingEvent::getFormattedMessage).toList();
    }

    @RestController
    public static class LogEndpoints {

        public String getLog() {
            return "2026-10-15 INFO earlier log lines";
        }

        public String getFlow() {
            return "flow";
        }

        public String getFlowByName() {
            return "flow";
        }

        public String getMissingFlow() {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        public String getBrokenFlow() {
            throw new IllegalStateException("broken");
        }

        public String getFlowAlerts() {
            return "alerts";
        }

        public String getJvmStats() {
            return "stats";
        }
    }
}
