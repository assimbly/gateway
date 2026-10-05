package org.assimbly.gateway.service.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;
import java.util.List;

/**
 * An API or Operation that breaks a rule, such as a method and path another Operation already has.
 * The message says what is wrong, and lists the conflicts when there are several.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ApiRuleException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    /** Each clash, for an import that is refused as a whole; empty for a single rule. */
    private final List<String> conflicts;

    public ApiRuleException(String message) {
        this(message, List.of());
    }

    public ApiRuleException(String message, List<String> conflicts) {
        super(conflicts.isEmpty() ? message : message + "\n- " + String.join("\n- ", conflicts));
        this.conflicts = List.copyOf(conflicts);
    }

    public List<String> getConflicts() {
        return conflicts;
    }
}
