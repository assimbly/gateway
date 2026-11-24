package org.assimbly.gateway.config.firststart;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.config.security.PasswordChangeGate;
import org.assimbly.gateway.domain.Authority;
import org.assimbly.gateway.domain.User;
import org.assimbly.gateway.repository.AuthorityRepository;
import org.assimbly.gateway.repository.UserRepository;
import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.service.dto.BrokerDTO;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;

/** What a server sets in environment variables wins over the database: the API user, admin's password, the broker. */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class EnvironmentOverridesIntTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordChangeGate gate;

    @Autowired
    private BrokerService brokerService;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private MockEnvironment env;
    private boolean adminWasGated;
    private boolean userWasGated;

    @BeforeEach
    void setUp() {
        env = new MockEnvironment();
        adminWasGated = gate.isRequired("admin");
        userWasGated = gate.isRequired("user");
    }

    @AfterEach
    void restoreTheGate() {
        // The database is rolled back, the gate (in memory) is not
        if (adminWasGated) {
            gate.require("admin");
        }
        if (userWasGated) {
            gate.require("user");
        }
    }

    @Test
    void theApiUserIsCreatedAsAUser() {
        env.withProperty(EnvironmentOverrides.API_USERNAME, "Service").withProperty(
            EnvironmentOverrides.API_PASSWORD,
            "a-long-api-password"
        );

        apply();

        User service = userRepository.findOneWithAuthoritiesByLogin("service").orElseThrow();
        assertThat(passwordEncoder.matches("a-long-api-password", service.getPassword())).isTrue();
        assertThat(service.isActivated()).isTrue();
        assertThat(service.isPasswordChangeRequired()).isFalse();
        assertThat(service.getAuthorities()).extracting(Authority::getName).containsExactly("ROLE_USER");
    }

    @Test
    void anExistingUserGetsThePasswordAndNeedNotChangeIt() {
        User user = userRepository.findOneByLogin("user").orElseThrow();
        user.setPasswordChangeRequired(true);
        userRepository.save(user);
        gate.require("user");
        env.withProperty(EnvironmentOverrides.API_USERNAME, "user").withProperty(EnvironmentOverrides.API_PASSWORD, "a-long-api-password");

        apply();

        User updated = userRepository.findOneByLogin("user").orElseThrow();
        assertThat(passwordEncoder.matches("a-long-api-password", updated.getPassword())).isTrue();
        assertThat(updated.isPasswordChangeRequired()).isFalse();
        assertThat(gate.isRequired("user")).isFalse();
    }

    @Test
    void theAdminPasswordIsSetAndAdminStaysAnAdministrator() {
        env.withProperty(EnvironmentOverrides.ADMIN_PASSWORD, "the-servers-admin-password");

        apply();

        User admin = userRepository.findOneWithAuthoritiesByLogin("admin").orElseThrow();
        assertThat(passwordEncoder.matches("the-servers-admin-password", admin.getPassword())).isTrue();
        assertThat(admin.getAuthorities()).extracting(Authority::getName).contains("ROLE_ADMIN");
        assertThat(gate.isRequired("admin")).isFalse();
    }

    @Test
    void withoutVariablesNothingChanges() {
        String adminPassword = userRepository.findOneByLogin("admin").orElseThrow().getPassword();
        long users = userRepository.count();

        apply();

        assertThat(userRepository.findOneByLogin("admin").orElseThrow().getPassword()).isEqualTo(adminPassword);
        assertThat(userRepository.count()).isEqualTo(users);
        assertThat(brokerService.findAll()).isEmpty();
    }

    @Test
    void aUsernameWithoutPasswordIsLeftAlone() {
        env.withProperty(EnvironmentOverrides.API_USERNAME, "service");

        apply();

        assertThat(userRepository.findOneByLogin("service")).isEmpty();
    }

    @Test
    void aLoginThatCantBeOneStopsTheStart() {
        env.withProperty(EnvironmentOverrides.API_USERNAME, "not a login").withProperty(
            EnvironmentOverrides.API_PASSWORD,
            "a-long-api-password"
        );

        assertThatThrownBy(this::apply).isInstanceOf(IllegalStateException.class).hasMessageContaining("not a login");
    }

    @Test
    void withoutABrokerOneIsCreatedThatStartsWithTheGateway() {
        env.withProperty(EnvironmentOverrides.BROKER_TYPE, "ActiveMQ");

        apply();

        assertThat(brokerService.findAll())
            .singleElement()
            .satisfies(broker -> {
                assertThat(broker.getType()).isEqualTo("activemq");
                assertThat(broker.getConfigurationType()).isEqualTo("file");
                assertThat(broker.isAutoStart()).isTrue();
            });
    }

    @Test
    void theBrokerTakesTheTypeAndConfigurationAndKeepsTheRest() {
        BrokerDTO existing = new BrokerDTO();
        existing.setName("test");
        existing.setType("artemis");
        existing.setConfigurationType("embedded");
        existing.setAutoStart(false);
        brokerService.save(existing);
        env.withProperty(EnvironmentOverrides.BROKER_TYPE, "activemq").withProperty(EnvironmentOverrides.BROKER_CONFIGURATION, "file");

        apply();

        List<BrokerDTO> brokers = brokerService.findAll();
        assertThat(brokers)
            .singleElement()
            .satisfies(broker -> {
                assertThat(broker.getName()).isEqualTo("test");
                assertThat(broker.getType()).isEqualTo("activemq");
                assertThat(broker.getConfigurationType()).isEqualTo("file");
                assertThat(broker.isAutoStart()).isFalse();
            });
    }

    private void apply() {
        new EnvironmentOverrides(
            env,
            userRepository,
            authorityRepository,
            passwordEncoder,
            gate,
            brokerService,
            cacheManager,
            transactionManager
        ).apply();
    }
}
