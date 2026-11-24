package org.assimbly.gateway.config.security;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;

/** The headless runtime takes the token of a Mongo user, as the runtime's JwtBuilder makes it, as a login. */
class MongoUserTokensTest {

    private static final String SECRET_KEY = "a-mongo-secret-key-of-at-least-thirty-two-bytes";

    private final List<String> passedOn = new ArrayList<>();
    private final JwtDecoder gatewayTokens = token -> {
        passedOn.add(token);
        return Jwt.withTokenValue(token).header("alg", "HS512").subject("gateway-user").build();
    };
    private final JwtDecoder decoder = MongoUserTokens.decoder(gatewayTokens, SECRET_KEY);

    @Test
    void aMongoUsersTokenIsALoginAsThatUser() {
        Jwt jwt = decoder.decode(userToken(SECRET_KEY, Instant.now().plusSeconds(3600)));

        assertThat(jwt.getSubject()).isEqualTo("someone@example.com");
        assertThat(jwt.getClaimAsString("auth")).isEqualTo("ROLE_USER");
        assertThat(passedOn).isEmpty();
    }

    @Test
    void aTokenSignedWithAnotherKeyIsRejected() {
        String token = userToken("another-mongo-secret-key-of-thirty-two-bytes", Instant.now().plusSeconds(3600));

        assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(BadJwtException.class);
    }

    @Test
    void anExpiredTokenIsRejected() {
        String token = userToken(SECRET_KEY, Instant.now().minusSeconds(60));

        assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(BadJwtException.class);
    }

    @Test
    void aTokenWithoutAUserIsRejected() {
        String token = Jwts.builder()
            .setExpiration(Date.from(Instant.now().plusSeconds(3600)))
            .signWith(SignatureAlgorithm.HS256, SECRET_KEY.getBytes(UTF_8))
            .compact();

        assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(BadJwtException.class);
    }

    @Test
    void theGatewaysOwnTokensAreLeftToItsDecoder() {
        byte[] key = new byte[64];
        String token = Jwts.builder().setSubject("operator").signWith(SignatureAlgorithm.HS512, key).compact();

        assertThat(decoder.decode(token).getSubject()).isEqualTo("gateway-user");
        assertThat(passedOn).containsExactly(token);
    }

    @Test
    void theTokenMayBeTheWholeAuthorizationHeader() {
        BearerTokenResolver resolver = MongoUserTokens.resolver();

        assertThat(resolver.resolve(request("aaa.bbb.ccc"))).isEqualTo("aaa.bbb.ccc");
        assertThat(resolver.resolve(request("Bearer aaa.bbb.ccc"))).isEqualTo("aaa.bbb.ccc");
    }

    @Test
    void aBasicLoginIsNotTakenForAToken() {
        BearerTokenResolver resolver = MongoUserTokens.resolver();
        String basic = Base64.getEncoder().encodeToString("someone@example.com:secret".getBytes(UTF_8));

        // How a client logs in at /api/db/authenticate: the base64 alone
        assertThat(resolver.resolve(request(basic))).isNull();
        assertThat(resolver.resolve(request("Basic " + basic))).isNull();
        assertThat(resolver.resolve(new MockHttpServletRequest())).isNull();
    }

    /** As the runtime's JwtBuilder makes it. */
    private static String userToken(String key, Instant expiration) {
        return Jwts.builder()
            .setSubject("aRandomOne")
            .setExpiration(Date.from(expiration))
            .claim("name", "someone@example.com")
            .claim("scope", "role")
            .signWith(SignatureAlgorithm.HS256, key.getBytes(UTF_8))
            .compact();
    }

    private static MockHttpServletRequest request(String authorization) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/integration/flow/1/info");
        request.addHeader(HttpHeaders.AUTHORIZATION, authorization);
        return request;
    }
}
