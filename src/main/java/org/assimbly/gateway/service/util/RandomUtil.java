package org.assimbly.gateway.service.util;

import java.security.SecureRandom;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Utility class for generating random Strings.
 */
public final class RandomUtil {

    private static final int DEF_COUNT = 20;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private RandomUtil() {
    }

    /**
     * Generate a password.
     *
     * @return the generated password
     */
    public static String generatePassword() {
        final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        return IntStream.range(0, DEF_COUNT)
            .map(_ -> SECURE_RANDOM.nextInt(CHARACTERS.length()))
            .mapToObj(CHARACTERS::charAt)
            .map(String::valueOf)
            .collect(Collectors.joining());
    }

    /**
     * Generate an activation key.
     *
     * @return the generated activation key
     */
    public static String generateActivationKey() {
        return IntStream.range(0, DEF_COUNT)
            .map(_ -> SECURE_RANDOM.nextInt(10)) // Generates a number between 0-9
            .mapToObj(String::valueOf)
            .collect(Collectors.joining());
    }

    /**
     * Generate a reset key.
     *
     * @return the generated reset key
     */
    public static String generateResetKey() {
        return IntStream.range(0, DEF_COUNT)
            .map(_ -> SECURE_RANDOM.nextInt(10)) // Generates a number between 0-9
            .mapToObj(String::valueOf)
            .collect(Collectors.joining());
    }

    /**
     * Generate a unique series to validate a persistent token, used in the
     * authentication remember-me mechanism.
     *
     * @return the generated series data
     */
    public static String generateSeriesData() {
        final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        return IntStream.range(0, DEF_COUNT)
            .map(_ -> SECURE_RANDOM.nextInt(CHARACTERS.length()))
            .mapToObj(CHARACTERS::charAt)
            .map(String::valueOf)
            .collect(Collectors.joining());
    }

    /**
     * Generate a persistent token, used in the authentication remember-me mechanism.
     *
     * @return the generated token data
     */
    public static String generateTokenData() {
        final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        return IntStream.range(0, DEF_COUNT)
            .map(_ -> SECURE_RANDOM.nextInt(CHARACTERS.length()))
            .mapToObj(CHARACTERS::charAt)
            .map(String::valueOf)
            .collect(Collectors.joining());
    }
}
