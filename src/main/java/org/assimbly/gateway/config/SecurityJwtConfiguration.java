package org.assimbly.gateway.config;

import static org.assimbly.gateway.security.SecurityUtils.AUTHORITIES_KEY;
import static org.assimbly.gateway.security.SecurityUtils.JWT_ALGORITHM;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;
import java.util.Arrays;
import java.util.Collection;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.assimbly.gateway.config.security.MongoUserTokens;
import org.assimbly.gateway.management.SecurityMetersService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

@Configuration
public class SecurityJwtConfiguration {

    @Value("${jhipster.security.authentication.jwt.base64-secret}")
    private String jwtKey;

    @Bean
    public JwtDecoder jwtDecoder(SecurityMetersService metersService, Environment env) {
        JwtDecoder gatewayTokens = gatewayTokens(metersService);
        String mongoSecretKey = env.getProperty(MongoUserTokens.SECRET_KEY);
        if (isHeadless(env) && mongoSecretKey != null && !mongoSecretKey.isBlank()) {
            return MongoUserTokens.decoder(gatewayTokens, mongoSecretKey);
        }
        return gatewayTokens;
    }

    /** Headless, a Mongo user's token may be the whole Authorization header; elsewhere only {@code Bearer <token>}. */
    @Bean
    public BearerTokenResolver bearerTokenResolver(Environment env) {
        return isHeadless(env) ? MongoUserTokens.resolver() : new DefaultBearerTokenResolver();
    }

    private static boolean isHeadless(Environment env) {
        return env.acceptsProfiles(Profiles.of("headless"));
    }

    private JwtDecoder gatewayTokens(SecurityMetersService metersService) {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(getSecretKey()).macAlgorithm(JWT_ALGORITHM).build();
        return token -> {
            try {
                return jwtDecoder.decode(token);
            } catch (Exception e) {
                if (e.getMessage().contains("Invalid signature")) {
                    metersService.trackTokenInvalidSignature();
                } else if (e.getMessage().contains("Jwt expired at")) {
                    metersService.trackTokenExpired();
                } else if (e.getMessage().contains("Invalid JWT serialization")) {
                    metersService.trackTokenMalformed();
                } else if (e.getMessage().contains("Invalid unsecured/JWS/JWE")) {
                    metersService.trackTokenMalformed();
                }
                throw e;
            }
        };
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey()));
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Object claim = jwt.getClaim(AUTHORITIES_KEY);
            if (claim == null) {
                return java.util.List.of();
            }
            String authorities =
                claim instanceof Collection<?> collection
                    ? collection.stream().map(String::valueOf).collect(Collectors.joining(" "))
                    : claim.toString();
            return Arrays.stream(authorities.split("[,\\s]+"))
                .filter(authority -> !authority.isBlank())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        });
        return jwtAuthenticationConverter;
    }

    private SecretKey getSecretKey() {
        byte[] keyBytes = Base64.from(jwtKey).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, JWT_ALGORITHM.getName());
    }
}
