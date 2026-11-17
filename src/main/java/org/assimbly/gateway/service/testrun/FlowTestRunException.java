package org.assimbly.gateway.service.testrun;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;

/** A test run that can't start, such as one for a Flow that isn't running. The message says what to do. */
@ResponseStatus(HttpStatus.CONFLICT)
public class FlowTestRunException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public FlowTestRunException(String message) {
        super(message);
    }
}
