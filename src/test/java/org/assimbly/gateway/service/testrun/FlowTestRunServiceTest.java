package org.assimbly.gateway.service.testrun;

import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FlowTestRunServiceTest {

    private CamelContext context;
    private FlowTestRunService service;

    /** Three steps of Flow 1, shaped like the runtime's route templates: the hand-off to the next step is inside the step. */
    @BeforeEach
    void startFlow() throws Exception {
        context = new DefaultCamelContext();
        context.addRoutes(new RouteBuilder() {
            @Override
            public void configure() {
                from("direct:1-10").routeId("1-10").group("1")
                    .step("step-10")
                        .setBody(simple("${body} A"))
                        .setHeader("X-Auth-Token", constant("secret-value"))
                        .to("direct:1-11")
                    .end();
                from("direct:1-11").routeId("1-11").group("1")
                    .step("step-11")
                        .choice().when(header("fail").isEqualTo("11")).throwException(new IllegalStateException("Boom")).end()
                        .setBody(simple("${body} B"))
                        .to("direct:1-12")
                    .end();
                // Built from a route template, as in the runtime, which puts its node prefix in front of the step id.
                from("direct:1-12").routeId("1-12").group("1")
                    .step("route-1step-12")
                        .delay(60).syncDelayed()
                        .setBody(simple("${body} C"))
                    .end();
            }
        });
        context.start();
        service = new FlowTestRunService(() -> context);
    }

    @AfterEach
    void stopFlow() {
        context.stop();
    }

    @Test
    void recordsEachStepsMessagesInStartOrder() {
        TestRunResult result = service.run("1", "10", new TestRunRequest("10", "Hi", Map.of("Customer", "42")));

        assertThat(result.status()).isEqualTo("completed");
        assertThat(result.error()).isNull();
        assertThat(result.runId()).isNotBlank();
        assertThat(result.response().body()).isEqualTo("Hi A B C");
        assertThat(result.steps()).extracting(TestRunResult.Step::stepId).containsExactly("10", "11", "12");
        assertThat(result.steps()).extracting(TestRunResult.Step::status).containsOnly("completed");

        TestRunResult.Step first = result.steps().get(0);
        assertThat(first.in().body()).isEqualTo("Hi");
        assertThat(first.in().headers()).containsEntry("Customer", "42");
        assertThat(first.out().body()).isEqualTo("Hi A");
        assertThat(first.out().headers()).containsEntry("X-Auth-Token", TestRunRecorder.MASK);
        assertThat(first.out().truncated()).isFalse();
        assertThat(Instant.parse(first.startedAt())).isBeforeOrEqualTo(Instant.parse(result.steps().get(1).startedAt()));

        assertThat(result.steps().get(1).in().body()).isEqualTo("Hi A");
        assertThat(result.steps().get(1).out().body()).isEqualTo("Hi A B");
        assertThat(result.steps().get(2).in().body()).isEqualTo("Hi A B");
        assertThat(result.steps().get(2).out().body()).isEqualTo("Hi A B C");
    }

    @Test
    void ownTimeLeavesOutTheStepsAfter() {
        TestRunResult result = service.run("1", "10", new TestRunRequest("10", "Hi", Map.of()));

        assertThat(result.steps()).allSatisfy(step -> assertThat(step.ownMillis()).isLessThanOrEqualTo(step.totalMillis()));
        TestRunResult.Step first = result.steps().get(0);
        assertThat(first.totalMillis()).isGreaterThanOrEqualTo(60);
        assertThat(first.ownMillis()).isLessThan(60);
        assertThat(result.steps().get(2).ownMillis()).isGreaterThanOrEqualTo(60);
        assertThat(result.durationMillis()).isGreaterThanOrEqualTo(first.totalMillis());
    }

    @Test
    void failingStepReportsItsErrorAndStopsTheRun() {
        TestRunResult result = service.run("1", "10", new TestRunRequest("10", "Hi", Map.of("fail", "11")));

        assertThat(result.status()).isEqualTo("failed");
        assertThat(result.error()).isEqualTo("Boom");
        assertThat(result.steps()).extracting(TestRunResult.Step::stepId).containsExactly("10", "11");
        TestRunResult.Step failing = result.steps().get(1);
        assertThat(failing.status()).isEqualTo("failed");
        assertThat(failing.error()).isEqualTo("Boom");
        assertThat(failing.in().body()).isEqualTo("Hi A");
    }

    @Test
    void startsAtAnyStepOfTheFlow() {
        TestRunResult result = service.run("1", "11", new TestRunRequest("11", "Hi", Map.of()));

        assertThat(result.steps()).extracting(TestRunResult.Step::stepId).containsExactly("11", "12");
        assertThat(result.response().body()).isEqualTo("Hi B C");
    }

    @Test
    void ignoresExchangesThatArentPartOfTheRun() {
        TestRunRecorder recorder = new TestRunRecorder();
        context.getManagementStrategy().addEventNotifier(recorder);
        TestRunRecorder.Run run = recorder.begin("run-1");

        try (var template = context.createProducerTemplate()) {
            template.requestBody("direct:1-11", "normal traffic");
            template.request("direct:1-11", exchange -> exchange.setProperty(TestRunRecorder.PROPERTY, "another-run"));
            template.request("direct:1-11", exchange -> {
                exchange.setProperty(TestRunRecorder.PROPERTY, "run-1");
                exchange.getMessage().setBody("tested");
            });
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }

        assertThat(run.steps()).extracting(TestRunResult.Step::stepId).containsExactly("11", "12");
        assertThat(run.steps().get(0).in().body()).isEqualTo("tested");
        recorder.end("run-1");
    }

    @Test
    void refusesStepsOutsideTheFlowReadably() {
        assertThatThrownBy(() -> service.run("1", "99", new TestRunRequest("99", "Hi", Map.of())))
            .isInstanceOf(FlowTestRunException.class)
            .hasMessage("That step isn't part of this Flow.");
        assertThatThrownBy(() -> service.run("2", "10", new TestRunRequest("10", "Hi", Map.of())))
            .isInstanceOf(FlowTestRunException.class)
            .hasMessage("Start the Flow first.");
    }

    @Test
    void readsTheStepIdBehindARouteTemplatesNodePrefix() {
        assertThat(TestRunRecorder.stepIdOf("step-10")).isEqualTo("10");
        assertThat(TestRunRecorder.stepIdOf("route-1step-1102")).isEqualTo("1102");
        assertThat(TestRunRecorder.stepIdOf("other")).isEqualTo("other");
        assertThat(TestRunRecorder.stepIdOf(null)).isNull();
    }

    @Test
    void cutsOffLargeBodies() {
        String large = "x".repeat(TestRunRecorder.MAX_BODY_CHARS + 10);

        TestRunResult result = service.run("1", "12", new TestRunRequest("12", large, Map.of()));

        TestRunResult.Message in = result.steps().get(0).in();
        assertThat(in.truncated()).isTrue();
        assertThat(in.body()).hasSize(TestRunRecorder.MAX_BODY_CHARS);
        assertThat(result.response().truncated()).isTrue();
    }
}
