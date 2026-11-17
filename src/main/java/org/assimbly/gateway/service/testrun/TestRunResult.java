package org.assimbly.gateway.service.testrun;

import java.util.List;
import java.util.Map;

/**
 * What happened in a test run: the message the entry step answered with, and each step the message passed, in the
 * order the steps started.
 *
 * @param status {@code completed} or {@code failed}
 */
public record TestRunResult(String runId, String status, long durationMillis, Message response, String error, List<Step> steps) {

    /** A message as it entered or left a step. Its body is cut off at 64 KB, and secret header values are masked. */
    public record Message(String body, Map<String, String> headers, boolean truncated) {
    }

    /**
     * One step the message passed.
     *
     * @param status {@code completed}, {@code failed}, or {@code running} when it hadn't finished when the run ended
     * @param startedAt when the message entered the step, as an ISO instant
     * @param ownMillis the time spent in the step itself, until it handed the message to the next step
     * @param totalMillis the time until the step finished, including the steps after it that it waited for
     * @param out the message the step handed on, or null when it never got that far
     */
    public record Step(String stepId, String status, String startedAt, long ownMillis, long totalMillis, Message in, Message out, String error) {
    }
}
