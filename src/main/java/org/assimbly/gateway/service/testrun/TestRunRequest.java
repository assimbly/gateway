package org.assimbly.gateway.service.testrun;

import java.util.Map;

/** What the user typed in the Flow editor's Test panel: the step to start at, and the message to send it. */
public record TestRunRequest(String entryStepId, String body, Map<String, String> headers) {
}
