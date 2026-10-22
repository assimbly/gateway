package org.assimbly.gateway.config.firststart;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.ConnectionKeysService;
import org.assimbly.gateway.service.ConnectionService;
import org.assimbly.gateway.service.dto.ConnectionDTO;
import org.assimbly.gateway.service.dto.ConnectionKeysDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/** Every Gateway has a messages folder Variable and, until it has one of its own, a Connection to the built-in broker. */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class GatewayConventionsIntTest {

    @Autowired
    private FirstStart firstStart;

    @Autowired
    private GatewayConventions conventions;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private EnvironmentVariablesRepository variablesRepository;

    @Autowired
    private ConnectionService connectionService;

    @Autowired
    private ConnectionKeysService connectionKeysService;

    @BeforeEach
    void aGatewayWithItsDefaultBroker() {
        assertThat(integrationRepository.count()).as("a new Gateway has no Integration").isZero();
        firstStart.setUp(false, true);
    }

    @Test
    void theMessagesVariableIsAFolderInTheHomeFolder() {
        conventions.addMissing();

        assertThat(variablesRepository.findAll()).singleElement().satisfies(variable -> {
            assertThat(variable.getKey()).isEqualTo("messages");
            assertThat(variable.getValue()).isEqualTo(System.getProperty("user.home").replace('\\', '/') + "/messages");
            assertThat(variable.getIntegration()).isNotNull();
        });
    }

    @Test
    void theGatewayBrokerConnectionIsAPooledArtemisConnectionWithAnEncryptedPassword() {
        conventions.addMissing();

        ConnectionDTO connection = connectionService.getAll().stream().filter(c -> "Gateway broker".equals(c.getName())).findFirst().orElseThrow();
        assertThat(connection.getType()).isEqualTo("SJMS");

        Map<String, String> keys = connectionKeysService.findAll().stream()
                .filter(key -> connection.getId().equals(key.getConnectionId()))
                .collect(Collectors.toMap(ConnectionKeysDTO::getKey, ConnectionKeysDTO::getValue));
        assertThat(keys).containsEntry("url", "tcp://localhost:61616")
                .containsEntry("username", "admin")
                .containsEntry("jmsprovider", "ActiveMQ Artemis")
                .containsEntry("pooled", "true");
        assertThat(keys.get("password")).startsWith("ENC(").isNotEqualTo("admin");
    }

    @Test
    void runningAgainAddsNothingTwice() {
        conventions.addMissing();
        conventions.addMissing();

        assertThat(variablesRepository.findAll()).hasSize(1);
        assertThat(connectionService.getAll()).hasSize(1);
    }

    @Test
    void aChangedVariableAndAnOwnJmsConnectionAreKept() {
        EnvironmentVariables mine = new EnvironmentVariables();
        mine.setKey("messages");
        mine.setValue("D:/data/messages");
        mine.setEncrypted(false);
        variablesRepository.save(mine);

        ConnectionDTO own = new ConnectionDTO();
        own.setName("LocalBroker");
        own.setType("SJMS");
        connectionService.save(own);

        conventions.addMissing();

        assertThat(variablesRepository.findAll()).singleElement().extracting(EnvironmentVariables::getValue).isEqualTo("D:/data/messages");
        assertThat(connectionService.getAll()).extracting(ConnectionDTO::getName).containsExactly("LocalBroker");
    }
}
