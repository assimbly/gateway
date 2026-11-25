package org.assimbly.gateway.config.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** The headless runtime's one user: an empty variable counts as not set, so it never makes an empty password. */
class HeadlessApiUserTest {

    @Test
    void anEmptyOrMissingValueIsTheDefault() {
        assertThat(HeadlessApiUser.username(null)).isEqualTo("admin");
        assertThat(HeadlessApiUser.username(" ")).isEqualTo("admin");
        assertThat(HeadlessApiUser.password(null)).isEqualTo("admin");
        assertThat(HeadlessApiUser.password("")).isEqualTo("admin");
    }

    @Test
    void aSetValueIsUsed() {
        assertThat(HeadlessApiUser.username(" service ")).isEqualTo("service");
        // Spaces count in a password
        assertThat(HeadlessApiUser.password(" a password ")).isEqualTo(" a password ");
    }

    @Test
    void theDefaultPasswordIsRecognisedHoweverItCameAbout() {
        assertThat(HeadlessApiUser.hasDefaultPassword(null)).isTrue();
        assertThat(HeadlessApiUser.hasDefaultPassword("")).isTrue();
        assertThat(HeadlessApiUser.hasDefaultPassword("admin")).isTrue();
        assertThat(HeadlessApiUser.hasDefaultPassword("a-password-of-its-own")).isFalse();
    }
}
