package org.assimbly.gateway.service.testrun;

import org.apache.camel.Exchange;
import org.apache.camel.Message;
import org.apache.camel.spi.CamelEvent;
import org.apache.camel.support.EventNotifierSupport;
import org.apache.camel.support.MessageHelper;

import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * Records what each step of a test run did, from Camel's step events. Each Assimbly step is a route whose body is a
 * {@code step} EIP with id {@code step-<stepId>}, and the hand-off to the next step happens inside it. So a step that
 * starts while another is open on the same exchange was handed the message by that one: that is where the open step's
 * own work ends and its {@code out} message is taken.
 * <p>
 * Only exchanges with the {@link #PROPERTY} of a run that was {@link #begin begun} are recorded; normal traffic passes
 * through untouched.
 */
public class TestRunRecorder extends EventNotifierSupport {

    /** The exchange property that marks an exchange as part of a test run; its value is the run id. */
    public static final String PROPERTY = "AssimblyTestRun";

    static final int MAX_STEPS = 500;
    static final int MAX_BODY_CHARS = 64 * 1024;
    static final String BINARY = "<binary content>";
    static final String MASK = "*****";

    private static final Duration MAX_AGE = Duration.ofMinutes(2);
    private static final Pattern SECRET_HEADER = Pattern.compile("auth|password|secret|token", Pattern.CASE_INSENSITIVE);
    private static final String STEP_PREFIX = "step-";

    private final Map<String, Run> runs = new ConcurrentHashMap<>();

    public TestRunRecorder() {
        setIgnoreCamelContextEvents(true);
        setIgnoreCamelContextInitEvents(true);
        setIgnoreExchangeEvents(true);
        setIgnoreRouteEvents(true);
        setIgnoreServiceEvents(true);
        setIgnoreStepEvents(false);
    }

    /** Starts recording the run with this id, and forgets runs that were never ended. */
    public Run begin(String runId) {
        long now = System.nanoTime();
        runs.values().removeIf(run -> now - run.createdNanos > MAX_AGE.toNanos());
        Run run = new Run(runId, now);
        runs.put(runId, run);
        return run;
    }

    /** Stops recording the run with this id. */
    public void end(String runId) {
        runs.remove(runId);
    }

    @Override
    public boolean isEnabled(CamelEvent event) {
        return event instanceof CamelEvent.StepEvent step && runOf(step.getExchange()) != null;
    }

    @Override
    public void notify(CamelEvent event) {
        if (!(event instanceof CamelEvent.StepEvent step)) {
            return;
        }
        Run run = runOf(step.getExchange());
        if (run == null) {
            return;
        }
        String stepId = stepIdOf(step.getStepId());
        switch (event) {
            case CamelEvent.StepStartedEvent _ -> run.started(step.getExchange(), stepId);
            case CamelEvent.StepCompletedEvent _ -> run.finished(step.getExchange(), false);
            case CamelEvent.StepFailedEvent _ -> run.finished(step.getExchange(), true);
            default -> {
            }
        }
    }

    /**
     * The Assimbly step id in a Camel step id: {@code step-12} gives {@code 12}. A route built from a route template
     * puts its node prefix in front, as in {@code route-1step-12}, so the id is what follows the last {@code step-}.
     */
    static String stepIdOf(String camelStepId) {
        if (camelStepId == null) {
            return null;
        }
        int prefix = camelStepId.lastIndexOf(STEP_PREFIX);
        return prefix >= 0 ? camelStepId.substring(prefix + STEP_PREFIX.length()) : camelStepId;
    }

    private Run runOf(Exchange exchange) {
        String runId = exchange.getProperty(PROPERTY, String.class);
        return runId == null ? null : runs.get(runId);
    }

    /** The message as the Test panel shows it: the body as text, cut off at 64 KB, and secret header values masked. */
    static TestRunResult.Message snapshot(Message message) {
        Object body = message.getBody();
        String text;
        boolean truncated = false;
        if (body == null) {
            text = "";
        } else if (body instanceof byte[] bytes && !isText(bytes)) {
            text = BINARY;
        } else {
            text = MessageHelper.extractBodyForLogging(message, "", true, false, false, MAX_BODY_CHARS);
            if (text.length() > MAX_BODY_CHARS) {
                text = text.substring(0, MAX_BODY_CHARS);
                truncated = true;
            }
        }

        Map<String, String> headers = new LinkedHashMap<>();
        message.getHeaders().forEach((name, value) ->
            headers.put(name, SECRET_HEADER.matcher(name).find() ? MASK : value == null ? "" : String.valueOf(value)));
        return new TestRunResult.Message(text, headers, truncated);
    }

    private static boolean isText(byte[] bytes) {
        for (byte b : bytes) {
            if (b == 0) {
                return false;
            }
        }
        try {
            StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
                .decode(ByteBuffer.wrap(bytes));
            return true;
        } catch (CharacterCodingException e) {
            return false;
        }
    }

    static String errorOf(Exchange exchange) {
        Exception exception = exchange.getException();
        if (exception == null) {
            exception = exchange.getProperty(Exchange.EXCEPTION_CAUGHT, Exception.class);
        }
        if (exception == null) {
            return null;
        }
        return exception.getMessage() != null ? exception.getMessage() : exception.getClass().getSimpleName();
    }

    /** The steps of one test run so far. Events of one run can come from several threads, so all access is synchronized. */
    public static final class Run {

        /** Stands in on the stack for a step past {@link #MAX_STEPS}, which isn't recorded. */
        private static final Recorded SKIPPED = new Recorded(null, null, 0, null, false);

        private final String id;
        private final long createdNanos;
        private final List<Recorded> steps = new ArrayList<>();
        /** The steps open on each exchange, innermost first. */
        private final Map<String, Deque<Recorded>> open = new HashMap<>();
        private int openCount;
        private long lastEventNanos;

        private Run(String id, long createdNanos) {
            this.id = id;
            this.createdNanos = createdNanos;
            this.lastEventNanos = createdNanos;
        }

        public String id() {
            return id;
        }

        private synchronized void started(Exchange exchange, String stepId) {
            long now = System.nanoTime();
            lastEventNanos = now;
            Deque<Recorded> stack = open.computeIfAbsent(exchange.getExchangeId(), key -> new ArrayDeque<>());
            Recorded parent = stack.peek();
            TestRunResult.Message message = snapshot(exchange.getMessage());
            if (parent != null && parent != SKIPPED && parent.out == null) {
                parent.out = message;
                parent.ownEndNanos = now;
            }
            openCount++;
            if (steps.size() >= MAX_STEPS) {
                stack.push(SKIPPED);
                return;
            }
            Recorded step = new Recorded(stepId, Instant.now(), now, message, exchange.getExchangeExtension().isFailureHandled());
            steps.add(step);
            stack.push(step);
        }

        private synchronized void finished(Exchange exchange, boolean failed) {
            long now = System.nanoTime();
            lastEventNanos = now;
            Deque<Recorded> stack = open.get(exchange.getExchangeId());
            if (stack == null || stack.isEmpty()) {
                return;
            }
            Recorded step = stack.pop();
            openCount--;
            if (stack.isEmpty()) {
                open.remove(exchange.getExchangeId());
            }
            if (step == SKIPPED) {
                return;
            }
            if (step.out == null) {
                step.out = snapshot(exchange.getMessage());
                step.ownEndNanos = now;
            }
            step.endNanos = now;
            // The Flow's Error handler takes the failure inside the step, which then completes; it failed all the same.
            failed = failed || (!step.failureHandledBefore && exchange.getExchangeExtension().isFailureHandled());
            step.status = failed ? "failed" : "completed";
            if (failed) {
                step.error = errorOf(exchange);
            }
        }

        /** Whether no step is open and nothing happened for the quiet period. */
        public synchronized boolean isSettled(Duration quiet) {
            return openCount == 0 && System.nanoTime() - lastEventNanos >= quiet.toNanos();
        }

        public synchronized boolean hasFailedStep() {
            return steps.stream().anyMatch(step -> "failed".equals(step.status));
        }

        /** The steps in the order they started; a step that is still open is timed until now. */
        public synchronized List<TestRunResult.Step> steps() {
            long now = System.nanoTime();
            return steps.stream().map(step -> {
                long ownEnd = step.ownEndNanos >= 0 ? step.ownEndNanos : now;
                long end = step.endNanos >= 0 ? step.endNanos : now;
                return new TestRunResult.Step(step.stepId, step.status, step.startedAt.toString(),
                    (ownEnd - step.startNanos) / 1_000_000, (end - step.startNanos) / 1_000_000, step.in, step.out, step.error);
            }).toList();
        }
    }

    private static final class Recorded {
        private final String stepId;
        private final Instant startedAt;
        private final long startNanos;
        private final TestRunResult.Message in;
        /** Whether an earlier failure was already handled when this step started, so it isn't this step's. */
        private final boolean failureHandledBefore;
        private TestRunResult.Message out;
        private long ownEndNanos = -1;
        private long endNanos = -1;
        private String status = "running";
        private String error;

        private Recorded(String stepId, Instant startedAt, long startNanos, TestRunResult.Message in, boolean failureHandledBefore) {
            this.stepId = stepId;
            this.startedAt = startedAt;
            this.startNanos = startNanos;
            this.in = in;
            this.failureHandledBefore = failureHandledBefore;
        }
    }
}
