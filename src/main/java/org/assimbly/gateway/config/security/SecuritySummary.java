package org.assimbly.gateway.config.security;

import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import tech.jhipster.config.JHipsterConstants;

import java.util.ArrayList;
import java.util.List;

/**
 * What still leaves a Gateway open, for one warning at startup. Empty when it runs with its secure defaults, and on
 * dev and headless, which are open on purpose.
 */
public final class SecuritySummary {

    /** The token key JHipster publishes in its example configuration. */
    static final String PUBLIC_JWT_SECRET = "bXktc2VjcmV0LWtleS13aGljaC1zaG91bGQtYmUtY2hhbmdlZC1pbi1wcm9kdWN0aW9uLWFuZC1iZS1iYXNlNjQtZW5jb2RlZAo=";

    private SecuritySummary() {}

    public static List<String> risks(Environment env) {
        List<String> risks = new ArrayList<>();
        if (env.acceptsProfiles(Profiles.of(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT, "headless"))) {
            return risks;
        }
        if (PUBLIC_JWT_SECRET.equals(env.getProperty(GeneratedSecrets.JWT_SECRET))) {
            risks.add("Login tokens are signed with a published key (" + GeneratedSecrets.JWT_SECRET + "): anyone can make one. Remove it to get a key of this Gateway's own.");
        }
        if (GeneratedSecrets.LEGACY_ENCRYPTION_SECRET.equals(env.getProperty(GeneratedSecrets.ENCRYPTION_SECRET))) {
            risks.add("Connection keys and Variables are encrypted with a published key (" + GeneratedSecrets.ENCRYPTION_SECRET + " or ASSIMBLY_ENCRYPTION_SECRET). Remove it to get a key of this Gateway's own.");
        }
        String runtimeSecret = env.getProperty(GeneratedSecrets.RUNTIME_ENCRYPTION_SECRET);
        if (runtimeSecret != null && !runtimeSecret.isBlank() && !runtimeSecret.equals(env.getProperty(GeneratedSecrets.ENCRYPTION_SECRET))) {
            risks.add("ASSIMBLY_ENCRYPTION_SECRET differs from " + GeneratedSecrets.ENCRYPTION_SECRET + ": encrypted Variables used in a Flow can't be read. Set only one of them.");
        }
        if (env.getProperty("application.security.registration", Boolean.class, false)) {
            risks.add("Anyone can create an account from the sign-in page (application.security.registration).");
        }
        if (env.getProperty("application.security.public-prometheus", Boolean.class, false)) {
            risks.add("Metrics can be read without signing in at /management/prometheus (application.security.public-prometheus).");
        }
        return risks;
    }
}
