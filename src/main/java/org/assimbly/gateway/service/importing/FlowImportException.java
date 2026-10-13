package org.assimbly.gateway.service.importing;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;

/** An import that can't be done because of what was handed in; the message says what is wrong with it. */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class FlowImportException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public FlowImportException(String message) {
        super(message);
    }

    public FlowImportException(String message, Throwable cause) {
        super(message, cause);
    }
}
