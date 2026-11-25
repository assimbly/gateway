package org.assimbly.gateway.config.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

/** The startup warning names what still leaves a Gateway, or the headless runtime, open. */
class SecuritySummaryTest {

    @Test
    void headlessWithTheDefaultLoginIsARisk() {
        MockEnvironment env = headless().withProperty("spring.security.user.password", "admin");

        assertThat(SecuritySummary.risks(env)).singleElement().asString().contains("ASSIMBLY_API_PASSWORD");
    }

    @Test
    void headlessWithALoginOfItsOwnIsNot() {
        MockEnvironment env = headless().withProperty("spring.security.user.password", "a-password-of-its-own");

        assertThat(SecuritySummary.risks(env)).isEmpty();
    }

    @Test
    void headlessWithThePublishedTokenKeyIsARisk() {
        MockEnvironment env = headless()
            .withProperty("spring.security.user.password", "a-password-of-its-own")
            .withProperty(GeneratedSecrets.JWT_SECRET, SecuritySummary.PUBLIC_JWT_SECRET);

        assertThat(SecuritySummary.risks(env)).singleElement().asString().contains("published key");
    }

    @Test
    void headlessKeepsNoVariablesSoItsEncryptionKeysMayDiffer() {
        MockEnvironment env = headless()
            .withProperty("spring.security.user.password", "a-password-of-its-own")
            .withProperty(GeneratedSecrets.ENCRYPTION_SECRET, "headless-key")
            .withProperty(GeneratedSecrets.RUNTIME_ENCRYPTION_SECRET, "server-key");

        assertThat(SecuritySummary.risks(env)).isEmpty();
    }

    @Test
    void devIsOpenOnPurpose() {
        MockEnvironment env = new MockEnvironment().withProperty("spring.security.user.password", "admin");
        env.setActiveProfiles("dev", "headless");

        assertThat(SecuritySummary.risks(env)).isEmpty();
    }

    @Test
    void headlessWithAnEmptyPasswordIsARiskToo() {
        MockEnvironment env = headless().withProperty("spring.security.user.password", "");

        assertThat(SecuritySummary.risks(env)).singleElement().asString().contains("ASSIMBLY_API_PASSWORD");
    }

    @Test
    void anAssimblyJwtSecretThatIsIgnoredIsARisk() {
        MockEnvironment env = headless()
            .withProperty("spring.security.user.password", "a-password-of-its-own")
            .withProperty(GeneratedSecrets.JWT_SECRET, "the-key-that-wins")
            .withProperty(GeneratedSecrets.RUNTIME_JWT_SECRET, "another-key");

        assertThat(SecuritySummary.risks(env)).singleElement().asString().contains("ASSIMBLY_JWT_SECRET is ignored");
    }

    @Test
    void anAssimblyJwtSecretThatIsUsedIsNot() {
        MockEnvironment env = headless()
            .withProperty("spring.security.user.password", "a-password-of-its-own")
            .withProperty(GeneratedSecrets.JWT_SECRET, "the-same-key")
            .withProperty(GeneratedSecrets.RUNTIME_JWT_SECRET, "the-same-key");

        assertThat(SecuritySummary.risks(env)).isEmpty();
    }

    private static MockEnvironment headless() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("headless");
        return env;
    }
}
