package org.assimbly.gateway.config.security;

import org.assimbly.util.EncryptionUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/** Values made with the key every Gateway used up to 6.0 are re-encrypted with the Gateway's own key. */
class LegacySecretMigrationTest {

    private static final String ALGORITHM = "PBEWithHMACSHA512AndAES_256";

    private final EncryptionUtil legacy = new EncryptionUtil(GeneratedSecrets.LEGACY_ENCRYPTION_SECRET, ALGORITHM);
    private final EncryptionUtil current = new EncryptionUtil("this-gateways-own-key", ALGORITHM);

    @Test
    void aValueMadeWithTheOldKeyIsReEncryptedWithTheNewOne() {
        Optional<String> reEncrypted = LegacySecretMigration.reEncrypt(legacy.encrypt("s3cret"), legacy, current);

        assertThat(reEncrypted).isPresent();
        assertThat(current.decrypt(reEncrypted.get())).isEqualTo("s3cret");
    }

    @Test
    void plainValuesAreLeftAsTheyAre() {
        assertThat(LegacySecretMigration.reEncrypt("plain", legacy, current)).isEmpty();
        assertThat(LegacySecretMigration.reEncrypt(null, legacy, current)).isEmpty();
        assertThat(LegacySecretMigration.reEncrypt("ENC(not|valid)", legacy, current)).isEmpty();
    }

    @Test
    void itIsDoneOnlyForTheKeyItRanWith(@TempDir Path dir) throws IOException {
        Path done = dir.resolve(LegacySecretMigration.DONE_FILE);
        assertThat(LegacySecretMigration.isDone(done, "key-a")).isFalse();

        Files.writeString(done, "# header\n" + LegacySecretMigration.fingerprint("key-a") + "\n");

        assertThat(LegacySecretMigration.isDone(done, "key-a")).isTrue();
        assertThat(LegacySecretMigration.isDone(done, "key-b")).isFalse();
        assertThat(LegacySecretMigration.fingerprint("key-a")).doesNotContain("key-a").hasSize(32);
    }
}
