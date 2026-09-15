package org.assimbly.gateway.authenticate.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.assimbly.gateway.authenticate.util.helper.ConfigHelper;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public final class JwtBuilder {

    private static final SecureRandom RANDOM = new SecureRandom();

    private JwtBuilder() {
        //Static class cannot be instantiated.
    }

    /**
     * Build an JSON Web Token (JWT) containing the given parameters.
     *
     * @param name    claim of the token.
     * @param scope   claim of the token.
     * @return a valid signed JSON Web Token.
     */
    public static String build(String name, String scope) {
        String key = System.getenv("MONGO_SECRET_KEY");
        int expiration = Integer.parseInt(ConfigHelper.get("expiration"));

        return Jwts.builder()
                .setSubject(createRandomString())
                .setExpiration(creatExpiration(expiration))
                .claim("name", name)
                .claim("scope", scope)
                .signWith(
                        SignatureAlgorithm.HS256,
                        key.getBytes(StandardCharsets.UTF_8)
                )
                .compact();
    }

    /**
     * Create a date used as an expiration date. Date is currentDate + given seconds.
     *
     * @param seconds the time to add to the current date in seconds.
     * @return a date represented as a Date object.
     */
    private static Date creatExpiration(int seconds) {
        LocalDateTime date = LocalDateTime.now(ZoneId.systemDefault());
        date = date.plusSeconds(seconds);

        Instant instant = date.atZone(ZoneId.systemDefault()).toInstant();
        return Date.from(instant);
    }

    /**
     * Create a random String 10 characters long.
     *
     * @return the created String.
     */
    private static String createRandomString() {

        String characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

        char[] s = new char[10];
        for (int i = 0; i < 10; i++) {
            s[i] = characters.charAt(RANDOM.nextInt(characters.length()));
        }
        return new String(s);
    }

}
