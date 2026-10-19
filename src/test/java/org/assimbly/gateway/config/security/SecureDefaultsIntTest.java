package org.assimbly.gateway.config.security;

import jakarta.servlet.Filter;
import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.repository.UserRepository;
import org.assimbly.gateway.security.jwt.TokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Outside dev, a Gateway is locked down: no open registration, management for administrators, no default passwords. */
@SpringBootTest(classes = GatewayApp.class)
class SecureDefaultsIntTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private PasswordChangeGate gate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationInfoContributor registrationInfo;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        Filter securityFilterChain = context.getBean("springSecurityFilterChain", Filter.class);
        mockMvc = MockMvcBuilders.webAppContextSetup(context).addFilters(securityFilterChain).build();
    }

    @AfterEach
    void openTheGate() {
        gate.clear("operator");
    }

    @Test
    void theDefaultAccountsMustChooseANewPassword() {
        assertThat(gate.isRequired("admin")).isTrue();
        assertThat(gate.isRequired("user")).isTrue();
        assertThat(userRepository.findOneByLogin("admin")).hasValueSatisfying(admin -> assertThat(admin.isPasswordChangeRequired()).isTrue());
    }

    @Test
    void aUserWithADefaultPasswordCanOnlyChooseANewOne() throws Exception {
        gate.require("operator");
        String token = token("operator", "ROLE_USER");

        mockMvc.perform(get("/api/flows").header(HttpHeaders.AUTHORIZATION, bearer(token)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.type").value(PasswordChangeFilter.PROBLEM_TYPE));
        mockMvc.perform(get("/management/info").header(HttpHeaders.AUTHORIZATION, bearer(token))).andExpect(status().isOk());

        // What choosing a new password needs stays open (the operator has no account here, so it isn't found)
        mockMvc.perform(get("/api/account").header(HttpHeaders.AUTHORIZATION, bearer(token)))
            .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(403));
        mockMvc.perform(post("/api/account/change-password").header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON).content("{\"currentPassword\":\"operator\",\"newPassword\":\"a-new-one\"}"))
            .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(403));

        gate.clear("operator");
        mockMvc.perform(get("/api/flows").header(HttpHeaders.AUTHORIZATION, bearer(token))).andExpect(status().isOk());
    }

    @Test
    void nobodyCanRegisterThemselves() throws Exception {
        String body = "{\"login\":\"stranger\",\"email\":\"stranger@example.com\",\"password\":\"stranger-password\",\"langKey\":\"en\"}";
        mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/register").header(HttpHeaders.AUTHORIZATION, bearer(token("operator", "ROLE_USER")))
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isNotFound());
        assertThat(userRepository.findOneByLogin("stranger")).isEmpty();
    }

    @Test
    void managementIsForAdministrators() throws Exception {
        for (String endpoint : List.of("/management/env", "/management/jolokia", "/management/metrics", "/management/prometheus", "/management/loggers")) {
            mockMvc.perform(get(endpoint)).andExpect(status().isUnauthorized());
            mockMvc.perform(get(endpoint).header(HttpHeaders.AUTHORIZATION, bearer(token("operator", "ROLE_USER")))).andExpect(status().isForbidden());
        }
        mockMvc.perform(get("/management/env").header(HttpHeaders.AUTHORIZATION, bearer(token("operator", "ROLE_USER", "ROLE_ADMIN"))))
            .andExpect(status().isOk());
    }

    @Test
    void whetherTheGatewayIsUpStaysPublic() throws Exception {
        mockMvc.perform(get("/management/health")).andExpect(status().isOk());
        mockMvc.perform(get("/management/info")).andExpect(status().isOk());
    }

    @Test
    void theSignInPageIsToldThatRegistrationIsOff() {
        Info.Builder info = new Info.Builder();
        registrationInfo.contribute(info);

        assertThat(info.build().get("registration")).isEqualTo(false);
    }

    @Test
    void theApiDescriptionNeedsASignIn() throws Exception {
        mockMvc.perform(get("/v3/api-docs")).andExpect(status().isUnauthorized());
    }

    private String token(String login, String... authorities) {
        return tokenProvider.createToken(
            new UsernamePasswordAuthenticationToken(login, null, Arrays.stream(authorities).map(SimpleGrantedAuthority::new).toList()),
            false
        );
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }
}
