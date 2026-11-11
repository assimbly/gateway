package org.assimbly.gateway.config;

import org.assimbly.gateway.config.security.PasswordChangeFilter;
import org.assimbly.gateway.config.security.PasswordChangeGate;
import org.assimbly.gateway.security.AuthoritiesConstants;
import org.assimbly.gateway.web.filter.SpaWebFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import tech.jhipster.config.JHipsterConstants;
import tech.jhipster.config.JHipsterProperties;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {

    private static final String[] STATIC_RESOURCES = {
        "/css/**", "/js/**", "/images/**", "/webjars/**", "/favicon.ico", "/static/**", "/public/**", "/resources/**",
        "/*.js", "/*.txt", "/*.json", "/*.map", "/*.css", "/*.ico", "/*.png", "/*.svg", "/*.webapp",
        "/index.html", "/app/**", "/i18n/**", "/content/**"
    };

    // Only whether the Gateway is up and what it is
    private static final String[] PUBLIC_ACTUATOR_ENDPOINTS = {
        "/health/**", "/management/health", "/management/health/**", "/management/info"
    };

    private static final String[] OPEN_MODE_ENDPOINTS = {
        "/v3/api-docs/**", "/swagger-ui/**", "/management/prometheus", "/management/jhiopenapigroups",
        "/management/jolokia", "/management/jolokia/**", "/management/hawtio", "/management/metrics"
    };

    private static final String API = "/api/**";
    private static final String MANAGEMENT = "/management/**";

    private final JHipsterProperties jHipsterProperties;
    private final ApplicationProperties.Security security;
    private final JwtAuthenticationConverter jwtAuthenticationConverter;
    private final PasswordChangeGate passwordChangeGate;

    private final boolean development;
    // Outside dev and headless, the Gateway is locked down unless its configuration opens something up.
    // The headless endpoints check their own credentials (Basic header or their own JWT).
    private final boolean secured;

    public SecurityConfiguration(Environment env, JHipsterProperties jHipsterProperties, ApplicationProperties applicationProperties,
                                 JwtAuthenticationConverter jwtAuthenticationConverter, PasswordChangeGate passwordChangeGate) {
        this.jHipsterProperties = jHipsterProperties;
        this.security = applicationProperties.getSecurity();
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
        this.passwordChangeGate = passwordChangeGate;
        this.development = env.acceptsProfiles(Profiles.of(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT));
        this.secured = !development && !env.acceptsProfiles(Profiles.of("headless"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CSRF protection is off on purpose: the Gateway is stateless and only accepts a token in the Authorization
    // header, which a browser never sends by itself. There is no cookie or session for a forged request to ride on,
    // and a CSRF token would lock out headless clients.
    @SuppressWarnings("java:S4502")
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .cors(withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(this::securityHeaders)
            .authorizeHttpRequests(this::authorizeRequests)
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)))
            .exceptionHandling(exceptions ->
                exceptions
                    .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                    .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
            )
            .addFilterAfter(new SpaWebFilter(), BasicAuthenticationFilter.class);

        if (secured) {
            // A user with a default password can only choose a new one
            http.addFilterAfter(new PasswordChangeFilter(passwordChangeGate), BearerTokenAuthenticationFilter.class);
        }

        return http.build();
    }

    private void securityHeaders(HeadersConfigurer<HttpSecurity> headers) {
        headers
            .contentSecurityPolicy(csp -> csp.policyDirectives(jHipsterProperties.getSecurity().getContentSecurityPolicy()))
            .frameOptions(FrameOptionsConfig::sameOrigin)
            .referrerPolicy(referrer -> referrer.policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            .permissionsPolicyHeader(withDefaults());
    }

    // The first matching rule wins, so the order of these rules matters
    private void authorizeRequests(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry authz) {
        authz
            .requestMatchers(STATIC_RESOURCES).permitAll()
            .requestMatchers(HttpMethod.POST, "/api/authenticate").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/account/first-sign-in").permitAll()
            .requestMatchers("/api/account/reset-password/init", "/api/account/reset-password/finish").permitAll()
            .requestMatchers(PUBLIC_ACTUATOR_ENDPOINTS).permitAll();

        if (!secured || security.isRegistration()) {
            authz.requestMatchers("/api/register", "/api/activate").permitAll();
        }

        if (secured) {
            securedAccess(authz);
        } else {
            openAccess(authz);
        }

        authz.anyRequest().authenticated();
    }

    private void securedAccess(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry authz) {
        if (security.isPublicPrometheus()) {
            authz.requestMatchers("/management/prometheus").permitAll();
        }
        authz
            .requestMatchers(API).authenticated()
            // Swagger UI itself is static, and the API Explorer frames it; the API description needs a sign-in
            .requestMatchers("/swagger-ui/**").permitAll()
            .requestMatchers("/v3/api-docs/**").authenticated()
            // Configuration, environment, threads, JMX (Jolokia): administrators only
            .requestMatchers(MANAGEMENT).hasAuthority(AuthoritiesConstants.ADMIN);
    }

    // On dev and headless the API is open, so Swagger UI and curl work without logging in
    private void openAccess(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry authz) {
        if (development) {
            authz
                .requestMatchers("/h2-console/**").permitAll()
                // The UI still logs in: it asks the account to know who is logged in
                .requestMatchers("/api/account", "/api/account/**").authenticated();
        }
        authz
            .requestMatchers(API).permitAll()
            .requestMatchers(OPEN_MODE_ENDPOINTS).permitAll()
            .requestMatchers(MANAGEMENT).authenticated();
    }

}
