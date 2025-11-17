package org.assimbly.gateway.config;

import org.assimbly.gateway.web.filter.SpaWebFilter;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import tech.jhipster.config.JHipsterConstants;
import tech.jhipster.config.JHipsterProperties;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {

    private final Environment env;
    private final JHipsterProperties jHipsterProperties;

    public SecurityConfiguration(Environment env, JHipsterProperties jHipsterProperties) {
        this.env = env;
        this.jHipsterProperties = jHipsterProperties;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .addFilterAfter(new SpaWebFilter(), BasicAuthenticationFilter.class)
            .headers(headers ->
                headers
                    .contentSecurityPolicy(csp -> csp.policyDirectives(jHipsterProperties.getSecurity().getContentSecurityPolicy()))
                    .frameOptions(FrameOptionsConfig::sameOrigin)
                    .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                    .permissionsPolicyHeader(Customizer.withDefaults())
            );

        if (env.acceptsProfiles(Profiles.of(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT))) {

            //permit all for easier testing
            http.authorizeHttpRequests(authz ->
                // prettier-ignore
                authz
                    .requestMatchers(
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/webjars/**",
                        "/favicon.ico",
                        "/static/**",
                        "/public/**",
                        "/resources/**"
                    ).permitAll()


                    // Specific static file extensions (already covered by atCommonLocations in most cases, but good to be explicit if you have custom paths)
                    .requestMatchers(
                        "/*.js", "/*.txt", "/*.json", "/*.map", "/*.css", "/*.ico", "/*.png", "/*.svg", "/*.webapp"
                    ).permitAll()

                    //enable database on dev
                    .requestMatchers("/h2-console/**").permitAll()

                    .requestMatchers("/**").permitAll());
        }else{

            http
                .authorizeHttpRequests(authz ->
                    authz
                        // Permit all requests for common static resources locations
                        .requestMatchers(
                            "/css/**",
                            "/js/**",
                            "/images/**",
                            "/webjars/**",
                            "/favicon.ico",
                            "/static/**",
                            "/public/**",
                            "/resources/**"
                        ).permitAll()

                        .requestMatchers(
                            "/*.js", "/*.txt", "/*.json", "/*.map", "/*.css", "/*.ico", "/*.png", "/*.svg", "/*.webapp"
                        ).permitAll()

                        // Application-specific public paths
                        .requestMatchers("/index.html").permitAll()
                        .requestMatchers("/app/**").permitAll()
                        .requestMatchers("/i18n/**").permitAll()
                        .requestMatchers("/content/**").permitAll()

                        // API authentication and registration
                        .requestMatchers(HttpMethod.POST, "/api/authenticate").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/authenticate").permitAll()
                        .requestMatchers("/api/register").permitAll()
                        .requestMatchers("/api/activate").permitAll()
                        .requestMatchers("/api/account/reset-password/init").permitAll()
                        .requestMatchers("/api/account/reset-password/finish").permitAll()
                        .requestMatchers("/api/**").permitAll() // TODO - changed back to permitAll. to be changed on the future, to make it more secure

                        // Actuator endpoints
                        .requestMatchers("/health/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll() // OpenAPI/Swagger docs (v3 is common for Spring Boot 3)
                        .requestMatchers("/swagger-ui/**").permitAll() // Swagger UI
                        .requestMatchers("/management/health").permitAll()
                        .requestMatchers("/management/health/**").permitAll()
                        .requestMatchers("/management/info").permitAll()
                        .requestMatchers("/management/prometheus").permitAll()
                        .requestMatchers("/management/jhiopenapigroups").permitAll()
                        .requestMatchers("/management/jolokia").permitAll()
                        .requestMatchers("/management/jolokia/**").permitAll()
                        .requestMatchers("/management/hawtio").permitAll()
                        .requestMatchers("/management/**").authenticated() // Secure other management endpoints

                        // Any other request not explicitly matched above requires authentication
                        .anyRequest().authenticated()
                );

        }

        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions ->
                exceptions
                    .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                    .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }

}
