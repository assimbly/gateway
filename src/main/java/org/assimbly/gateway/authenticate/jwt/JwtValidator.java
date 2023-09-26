package org.assimbly.gateway.authenticate.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.assimbly.gateway.authenticate.util.helper.ConfigHelper;
import org.slf4j.LoggerFactory;

import java.io.UnsupportedEncodingException;

public final class JwtValidator {

    private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(JwtValidator.class);

    private JwtValidator() {
        //Static class cannot be instantiated.
    }

    /**
     * Check if a JSON Web Token is valid.
     * This means that the signature is correct
     * and the current date is not before the starting date
     * and the current date is not after the expiration date.
     *
     * @param jwt to check.
     * @return true if the token is valid.
     */
    public static boolean validSession(String jwt) {
        return validJwt(jwt);
    }

    public static boolean validJwt(String jwt) {
        boolean valid;

        try {
            decode(jwt);
            valid = true;
        } catch (JwtException | UnsupportedEncodingException e) {
            LOG.warn(e.getMessage());
            valid = false;
        }

        return valid;
    }

    /**
     * Decode the JSON Web Token. The decoding process will throw exceptions
     * when something is wrong with the token.
     *
     * @param jwt to decode.
     * @return the body of the decoded token.
     * @throws JwtException                 when something is wrong with the token.
     * @throws UnsupportedEncodingException when the encoding used to sign the token is not supported.
     */
    public static Claims decode(String jwt) throws JwtException, UnsupportedEncodingException {
        String key = System.getenv("MONGO_SECRET_KEY");

        return Jwts.parser()
                .setSigningKey(key.getBytes("UTF-8"))
                .parseClaimsJws(jwt)
                .getBody();
    }

}
