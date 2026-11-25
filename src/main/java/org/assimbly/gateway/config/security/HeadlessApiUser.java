package org.assimbly.gateway.config.security;

/**
 * The headless runtime's one user, from {@code spring.security.user} (ASSIMBLY_API_USERNAME and ASSIMBLY_API_PASSWORD).
 * A value that is empty counts as not set, so an empty variable never makes an empty password: the user is then
 * {@code admin}/{@code admin}, which the startup warning names.
 */
public final class HeadlessApiUser {

    static final String DEFAULT = "admin";

    private HeadlessApiUser() {}

    public static String username(String configured) {
        return isBlank(configured) ? DEFAULT : configured.trim();
    }

    public static String password(String configured) {
        return isBlank(configured) ? DEFAULT : configured;
    }

    /** Whether the API accepts the password everyone knows. */
    public static boolean hasDefaultPassword(String configured) {
        return DEFAULT.equals(password(configured));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
