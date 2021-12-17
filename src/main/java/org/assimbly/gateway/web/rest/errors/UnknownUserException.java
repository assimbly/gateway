package org.assimbly.gateway.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class UnknownUserException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public UnknownUserException() {
        super(ErrorConstants.USER_NOT_FOUND_TYPE, "User not found", Status.UNAUTHORIZED);
    }
}
