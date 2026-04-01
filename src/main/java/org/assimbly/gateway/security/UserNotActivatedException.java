package org.assimbly.gateway.security;

import org.springframework.security.core.AuthenticationException;

import java.io.Serial;

/**
 * This exception is thrown in case of a not activated user trying to authenticate.
 */
public class UserNotActivatedException extends AuthenticationException {

    @Serial
    private static final long serialVersionUID = 1L;

    public UserNotActivatedException(String message) {
        super(message);
    }

    public UserNotActivatedException(String message, Throwable t) {
        super(message, t);
    }
}
