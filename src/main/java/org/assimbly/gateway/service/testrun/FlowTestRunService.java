package org.assimbly.gateway.service.testrun;

import org.apache.camel.AsyncProcessor;
import org.apache.camel.CamelContext;
import org.apache.camel.Consumer;
import org.apache.camel.Exchange;
import org.apache.camel.ExchangePattern;
import org.apache.camel.Route;
import org.apache.camel.ServiceStatus;
import org.apache.camel.support.AsyncProcessorConverterHelper;
import org.assimbly.integrationrest.IntegrationRuntime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;

/**
 * Test runs from the Flow editor: sends the user's message into one step of a running Flow and reports what each step
 * did with it. The message goes straight into the step's route, past its endpoint, so a test of a JMS or file step
 * doesn't put anything on a queue or disk; the steps after it do run for real.
 */
@Service
public class FlowTestRunService {

    static final Duration RESPONSE_TIMEOUT = Duration.ofSeconds(30);
    static final Duration QUIET = Duration.ofMillis(250);
    static final Duration SETTLE_TIMEOUT = Duration.ofSeconds(5);

    private final Supplier<CamelContext> contexts;

    private CamelContext recorderContext;
    private TestRunRecorder recorder;

    @Autowired
    public FlowTestRunService(IntegrationRuntime integrationRuntime) {
        this(() -> {
            try {
                return integrationRuntime.getIntegration().getContext();
            } catch (Exception e) {
                throw new FlowTestRunException("The runtime isn't ready yet: " + e.getMessage());
            }
        });
    }

    public FlowTestRunService(Supplier<CamelContext> contexts) {
        this.contexts = contexts;
    }

    public TestRunResult run(String flowId, String entryStepId, TestRunRequest request) {
        if (entryStepId == null || entryStepId.isBlank()) {
            throw new FlowTestRunException("Pick the step to start the test at.");
        }
        CamelContext context = contexts.get();
        if (context == null) {
            throw new FlowTestRunException("Start the Flow first.");
        }
        Route route = context.getRoute(flowId + "-" + entryStepId);
        if (route == null) {
            boolean flowHasRoutes = context.getRoutes().stream().anyMatch(candidate -> flowId.equals(candidate.getGroup()));
            throw new FlowTestRunException(flowHasRoutes ? "That step isn't part of this Flow." : "Start the Flow first.");
        }
        ServiceStatus status = context.getRouteController().getRouteStatus(route.getRouteId());
        Consumer consumer = route.getConsumer();
        if (consumer == null || status == null || !status.isStarted()) {
            throw new FlowTestRunException("Start the Flow first.");
        }

        TestRunRecorder recorder = recorderFor(context);
        TestRunRecorder.Run run = recorder.begin(UUID.randomUUID().toString());
        try {
            Exchange exchange = consumer.createExchange(false);
            exchange.setPattern(ExchangePattern.InOut);
            exchange.setProperty(TestRunRecorder.PROPERTY, run.id());
            exchange.getMessage().setBody(request.body() == null ? "" : request.body());
            Map<String, String> headers = request.headers() == null ? Map.of() : request.headers();
            headers.forEach((name, value) -> {
                if (name != null && !name.isBlank()) {
                    exchange.getMessage().setHeader(name, value);
                }
            });

            long started = System.nanoTime();
            boolean timedOut = !process(consumer, exchange, run.id());
            long durationMillis = (System.nanoTime() - started) / 1_000_000;
            if (!timedOut) {
                settle(run);
            }

            var steps = run.steps();
            // A failure the Flow's Error handler took leaves the exchange without an exception, but it failed all the same.
            boolean failed = timedOut || exchange.isFailed() || exchange.getExchangeExtension().isFailureHandled() || run.hasFailedStep();
            String error = timedOut
                ? "The Flow didn't answer within " + RESPONSE_TIMEOUT.toSeconds() + " seconds."
                : failed ? TestRunRecorder.errorOf(exchange) : null;
            if (error == null && failed) {
                error = steps.stream().map(TestRunResult.Step::error).filter(stepError -> stepError != null).findFirst().orElse(null);
            }
            return new TestRunResult(run.id(), failed ? "failed" : "completed", durationMillis,
                timedOut ? null : TestRunRecorder.snapshot(exchange.getMessage()), error, steps);
        } finally {
            recorder.end(run.id());
        }
    }

    /**
     * Lets the entry step's route process the exchange on a thread of its own, so a step that hangs can't hold the
     * request past the timeout. Returns false when the route didn't finish in time.
     */
    private static boolean process(Consumer consumer, Exchange exchange, String runId) {
        AsyncProcessor processor = AsyncProcessorConverterHelper.convert(consumer.getProcessor());
        CompletableFuture<Void> done = new CompletableFuture<>();
        Thread.ofVirtual().name("flow-test-run-" + runId).start(() -> {
            try {
                processor.process(exchange, doneSync -> done.complete(null));
            } catch (Exception e) {
                exchange.setException(e);
                done.complete(null);
            }
        });
        try {
            done.get(RESPONSE_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
            return true;
        } catch (TimeoutException e) {
            return false;
        } catch (ExecutionException e) {
            exchange.setException(e.getCause());
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new FlowTestRunException("The test run was interrupted.");
        }
    }

    /** Waits for steps that still run after the answer came back, such as ones behind a queue or a wire tap. */
    private static void settle(TestRunRecorder.Run run) {
        long deadline = System.nanoTime() + SETTLE_TIMEOUT.toNanos();
        while (!run.isSettled(QUIET) && System.nanoTime() < deadline) {
            try {
                Thread.sleep(25);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    /** The recorder on this context, added the first time a test runs on it. */
    private synchronized TestRunRecorder recorderFor(CamelContext context) {
        if (recorderContext != context) {
            recorder = new TestRunRecorder();
            context.getManagementStrategy().addEventNotifier(recorder);
            recorderContext = context;
        }
        return recorder;
    }
}
