package org.assimbly.gateway.service.testrun;

import org.apache.camel.AsyncProcessor;
import org.apache.camel.CamelContext;
import org.apache.camel.Consumer;
import org.apache.camel.Exchange;
import org.apache.camel.Route;
import org.apache.camel.ServiceStatus;
import org.apache.camel.support.AsyncProcessorConverterHelper;
import org.assimbly.integrationrest.IntegrationRuntime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
        Consumer consumer = startedConsumer(context, flowId, entryStepId);

        TestRunRecorder runRecorder = recorderFor(context);
        TestRunRecorder.Run run = runRecorder.begin(UUID.randomUUID().toString());
        try {
            Exchange exchange = exchange(consumer, run.id(), request);

            long started = System.nanoTime();
            boolean timedOut = !process(consumer, exchange, run.id());
            long durationMillis = (System.nanoTime() - started) / 1_000_000;
            if (!timedOut) {
                settle(run);
            }

            List<TestRunResult.Step> steps = run.steps();
            // A failure the Flow's Error handler took leaves the exchange without an exception, but it failed all the same.
            boolean failed = timedOut || exchange.isFailed() || exchange.getExchangeExtension().isFailureHandled() || run.hasFailedStep();
            return new TestRunResult(run.id(), failed ? "failed" : "completed", durationMillis,
                timedOut ? null : TestRunRecorder.snapshot(exchange.getMessage()), error(exchange, timedOut, failed, steps), steps);
        } finally {
            runRecorder.end(run.id());
        }
    }

    /** The consumer of the entry step's route, which must belong to the Flow and be started. */
    private static Consumer startedConsumer(CamelContext context, String flowId, String entryStepId) {
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
        return consumer;
    }

    /** The user's message as an exchange of the entry step, marked as part of this run. */
    private static Exchange exchange(Consumer consumer, String runId, TestRunRequest request) {
        // Keeps the pattern of the step's own endpoint, as for real traffic: forcing InOut would make a JMS Sink of
        // a file Flow wait for a reply that no one sends.
        Exchange exchange = consumer.createExchange(false);
        exchange.setProperty(TestRunRecorder.PROPERTY, runId);
        exchange.getMessage().setBody(request.body() == null ? "" : request.body());
        Map<String, String> headers = request.headers() == null ? Map.of() : request.headers();
        headers.forEach((name, value) -> {
            if (name != null && !name.isBlank()) {
                exchange.getMessage().setHeader(name, value);
            }
        });
        return exchange;
    }

    /** Why the run failed: the timeout, else the exchange's error, else the first step's; null when it didn't fail. */
    private static String error(Exchange exchange, boolean timedOut, boolean failed, List<TestRunResult.Step> steps) {
        if (timedOut) {
            return "The Flow didn't answer within " + RESPONSE_TIMEOUT.toSeconds() + " seconds.";
        }
        if (!failed) {
            return null;
        }
        String error = TestRunRecorder.errorOf(exchange);
        if (error != null) {
            return error;
        }
        return steps.stream().map(TestRunResult.Step::error).filter(Objects::nonNull).findFirst().orElse(null);
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
        } catch (TimeoutException _) {
            return false;
        } catch (ExecutionException e) {
            exchange.setException(e.getCause());
            return true;
        } catch (InterruptedException _) {
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
            } catch (InterruptedException _) {
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
