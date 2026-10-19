package org.assimbly.gateway.config.security;

import jakarta.annotation.PostConstruct;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.domain.ConnectionKeys;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.repository.ConnectionKeysRepository;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.util.EncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

/**
 * Up to 6.0 every Gateway encrypted its Connection keys and Variables with the same, published key. A Gateway that
 * now has its own key re-encrypts those values with it, once, when it is upgraded, so they still work.
 * <p>
 * It runs before the runtime starts ({@link BeforeRuntimeStart}), so no Flow sees an old value. It tries the old key
 * first: a value made with the old key never fails with it, while a wrong key can now and then decrypt to garbage
 * instead of failing. Running only once, before any value is made with the new key, keeps that from happening.
 */
@Lazy(false)
@Component
public class LegacySecretMigration implements BeforeRuntimeStart {

    static final String LEGACY_ENCRYPTION_SECRET = GeneratedSecrets.LEGACY_ENCRYPTION_SECRET;

    static final String DONE_FILE = "legacy-secrets-migrated";

    private final Logger log = LoggerFactory.getLogger(LegacySecretMigration.class);

    private final EncryptionProperties encryptionProperties;
    private final ConnectionKeysRepository connectionKeysRepository;
    private final EnvironmentVariablesRepository environmentVariablesRepository;
    private final TransactionTemplate transactionTemplate;

    public LegacySecretMigration(EncryptionProperties encryptionProperties, ConnectionKeysRepository connectionKeysRepository,
                                 EnvironmentVariablesRepository environmentVariablesRepository, PlatformTransactionManager transactionManager) {
        this.encryptionProperties = encryptionProperties;
        this.connectionKeysRepository = connectionKeysRepository;
        this.environmentVariablesRepository = environmentVariablesRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @PostConstruct
    void init() {
        Path done = GeneratedSecrets.secretsFile().resolveSibling(DONE_FILE);
        String key = encryptionProperties.getJasypt().getPassword();
        if (key == null || key.equals(LEGACY_ENCRYPTION_SECRET) || isDone(done, key)) {
            return;
        }
        Integer migrated = transactionTemplate.execute(status -> migrate(key));
        if (migrated != null && migrated > 0) {
            log.info("Re-encrypted {} Connection keys and Variables with this Gateway's own key", migrated);
        }
        markDone(done, key);
    }

    /** Done for this key: the file holds the key's fingerprint, so a run with another key doesn't count. */
    static boolean isDone(Path done, String key) {
        try {
            return Files.isRegularFile(done) && Files.readAllLines(done).contains(fingerprint(key));
        } catch (IOException e) {
            return false;
        }
    }

    static String fingerprint(String key) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(key.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash, 0, 16);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    /** Re-encrypts every value made with the old key; returns how many there were. */
    int migrate(String key) {
        EncryptionUtil legacy = new EncryptionUtil(LEGACY_ENCRYPTION_SECRET, encryptionProperties.getJasypt().getAlgorithm());
        EncryptionUtil current = new EncryptionUtil(key, encryptionProperties.getJasypt().getAlgorithm());
        int migrated = 0;

        for (ConnectionKeys connectionKey : connectionKeysRepository.findAll()) {
            Optional<String> value = reEncrypt(connectionKey.getValue(), legacy, current);
            if (value.isPresent()) {
                connectionKey.setValue(value.get());
                connectionKeysRepository.save(connectionKey);
                migrated++;
            }
        }
        for (EnvironmentVariables variable : environmentVariablesRepository.findAll()) {
            Optional<String> value = reEncrypt(variable.getValue(), legacy, current);
            if (value.isPresent()) {
                variable.setValue(value.get());
                environmentVariablesRepository.save(variable);
                migrated++;
            }
        }
        return migrated;
    }

    /** The value encrypted with the current key, when it is an encrypted value the old key can read. */
    static Optional<String> reEncrypt(String value, EncryptionUtil legacy, EncryptionUtil current) {
        if (value == null || !value.startsWith(EncryptionUtil.ENCODE_PREFIX) || !value.endsWith(EncryptionUtil.ENCODE_SUFFIX)) {
            return Optional.empty();
        }
        try {
            return Optional.of(current.encrypt(legacy.decrypt(value)));
        } catch (RuntimeException e) {
            // Not made with the old key: leave it as it is
            return Optional.empty();
        }
    }

    private void markDone(Path done, String key) {
        try {
            Files.createDirectories(done.getParent());
            String line = fingerprint(key) + System.lineSeparator();
            if (!Files.exists(done)) {
                Files.writeString(done, "# Values encrypted with the pre-6.0 key were re-encrypted with the key of each fingerprint below." + System.lineSeparator());
            }
            Files.writeString(done, line, StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not write " + done, e);
        }
    }
}
