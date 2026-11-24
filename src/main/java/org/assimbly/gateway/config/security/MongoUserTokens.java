package org.assimbly.gateway.config.security;

import static java.nio.charset.StandardCharsets.UTF_8;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jwt.JWTParser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import java.text.ParseException;
import java.util.regex.Pattern;
import org.assimbly.gateway.security.AuthoritiesConstants;
import org.assimbly.gateway.security.SecurityUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

/**
 * The token a user kept in Mongo gets from the headless runtime at {@code GET /api/db/authenticate}, once the runtime
 * has checked their email and password there. It is signed with {@code MONGO_SECRET_KEY} (HS256), and clients may send
 * it as the whole {@code Authorization} header, without {@code Bearer}.
 * <p>
 * The headless runtime takes it as a login to its API, as a user without administrator rights. The Gateway's own
 * tokens (HS512, from {@code POST /api/authenticate}) work there as everywhere.
 */
public final class MongoUserTokens {

    public static final String SECRET_KEY = "MONGO_SECRET_KEY";

    // A JWT is three base64url parts joined by dots. A Basic login is base64, which has no dots, so it is never taken for one.
    private static final Pattern JWT = Pattern.compile("[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+");

    private MongoUserTokens() {}

    /** Reads {@code Bearer <token>} as usual, and also a token that is the whole Authorization header. */
    public static BearerTokenResolver resolver() {
        DefaultBearerTokenResolver bearer = new DefaultBearerTokenResolver();
        return request -> {
            String header = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (header != null && JWT.matcher(header).matches()) {
                return header;
            }
            return bearer.resolve(request);
        };
    }

    /** Checks a Mongo user's token with the secret key, and leaves any other token to the Gateway's decoder. */
    public static JwtDecoder decoder(JwtDecoder gatewayTokens, String secretKey) {
        return token -> isMongoUserToken(token) ? decode(token, secretKey) : gatewayTokens.decode(token);
    }

    private static boolean isMongoUserToken(String token) {
        try {
            return JWSAlgorithm.HS256.equals(JWTParser.parse(token).getHeader().getAlgorithm());
        } catch (ParseException _) {
            // Not a JWT at all: the Gateway's decoder says so
            return false;
        }
    }

    /** As the runtime's JwtValidator checks it: signed with the secret key, and not expired. */
    private static Jwt decode(String token, String secretKey) {
        Claims claims;
        try {
            claims = Jwts.parser().setSigningKey(secretKey.getBytes(UTF_8)).build().parseClaimsJws(token).getBody();
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            throw new BadJwtException("Invalid Mongo user token: " + e.getMessage(), e);
        }

        String user = claims.get("name", String.class);
        if (user == null || user.isBlank() || claims.getExpiration() == null) {
            throw new BadJwtException("Invalid Mongo user token: it names no user or never expires");
        }

        return Jwt.withTokenValue(token)
            .header("alg", JWSAlgorithm.HS256.getName())
            .subject(user)
            .expiresAt(claims.getExpiration().toInstant())
            .claim(SecurityUtils.AUTHORITIES_KEY, AuthoritiesConstants.USER)
            .build();
    }
}
