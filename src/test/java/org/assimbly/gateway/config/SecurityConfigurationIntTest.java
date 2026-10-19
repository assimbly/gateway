package org.assimbly.gateway.config;

import jakarta.servlet.Filter;
import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.security.jwt.TokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Base64;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The management API only answers callers that are logged in. */
@SpringBootTest(classes = GatewayApp.class)
class SecurityConfigurationIntTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private TokenProvider tokenProvider;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        Filter securityFilterChain = context.getBean("springSecurityFilterChain", Filter.class);
        mockMvc = MockMvcBuilders.webAppContextSetup(context).addFilters(securityFilterChain).build();
    }

    @Test
    void anApiCallWithoutCredentialsIsRejected() throws Exception {
        mockMvc.perform(get("/api/flows")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/connections")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/routes/getallroutes")).andExpect(status().isUnauthorized());
    }

    @Test
    void anApiCallWithBasicCredentialsIsRejected() throws Exception {
        String basic = Base64.getEncoder().encodeToString("admin:wrong".getBytes());
        mockMvc.perform(get("/api/flows").header(HttpHeaders.AUTHORIZATION, "Basic " + basic))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void anApiCallWithAnInvalidTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/flows").header(HttpHeaders.AUTHORIZATION, "Bearer invalid"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void anApiCallWithAValidTokenIsAnswered() throws Exception {
        // Not admin: the seeded admin still has its default password, so it can only choose a new one
        String token = tokenProvider.createToken(
            new UsernamePasswordAuthenticationToken("operator", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))),
            false
        );
        mockMvc.perform(get("/api/flows").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    void theEnvironmentEndpointNeedsCredentials() throws Exception {
        mockMvc.perform(get("/management/env")).andExpect(status().isUnauthorized());
    }

    @Test
    void publicInfoStaysOpen() throws Exception {
        mockMvc.perform(get("/management/info")).andExpect(status().isOk());
    }
}
