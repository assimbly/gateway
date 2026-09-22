package org.assimbly.gateway.domain.enumeration;

/**
 * User appearance preference. SYSTEM follows the operating system/browser color scheme.
 */
public enum ThemePreference {
    SYSTEM,
    LIGHT,
    DARK;

    public static ThemePreference fromNullable(ThemePreference value) {
        return value == null ? SYSTEM : value;
    }
}
