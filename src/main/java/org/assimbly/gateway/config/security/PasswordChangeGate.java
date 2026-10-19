package org.assimbly.gateway.config.security;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The users who must choose a new password before they can use the Gateway, because theirs is still a default one.
 * Kept in memory for {@link PasswordChangeFilter}, which looks at every request; the user's
 * {@code passwordChangeRequired} column is where it is stored.
 */
@Component
public class PasswordChangeGate {

    private final Set<String> logins = ConcurrentHashMap.newKeySet();

    public void require(String login) {
        logins.add(normalize(login));
    }

    public void clear(String login) {
        logins.remove(normalize(login));
    }

    public boolean isRequired(String login) {
        return login != null && logins.contains(normalize(login));
    }

    public boolean isEmpty() {
        return logins.isEmpty();
    }

    private static String normalize(String login) {
        return login.toLowerCase(Locale.ENGLISH);
    }
}
