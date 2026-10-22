package org.assimbly.gateway.config.firststart;

import jakarta.annotation.PostConstruct;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.service.ConnectionKeysService;
import org.assimbly.gateway.service.ConnectionService;
import org.assimbly.gateway.service.dto.ConnectionDTO;
import org.assimbly.gateway.service.dto.ConnectionKeysDTO;
import org.assimbly.util.EncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

/**
 * What a Gateway offers by convention, so a Flow (and a tutorial) can use it without setting it up first:
 * <ul>
 *   <li>the Variable {@code messages}, a folder for files in the home folder ({@code /data/messages} with Docker), so
 *   a File Step's path reads {@code @{messages}/in} on every machine;</li>
 *   <li>the Connection {@code Gateway broker} to the built-in broker, while there is no Simple JMS Connection yet.</li>
 * </ul>
 * Each is added on start when it is missing, also to a Gateway set up before it existed; a changed one is kept.
 */
@Lazy(false)
@Component
@DependsOn("firstStart")
public class GatewayConventions {

    static final String MESSAGES_VARIABLE = "messages";
    static final String BROKER_CONNECTION = "Gateway broker";
    static final String BROKER_CONNECTION_TYPE = "SJMS";

    private final Logger log = LoggerFactory.getLogger(GatewayConventions.class);

    private final ApplicationProperties applicationProperties;
    private final IntegrationRepository integrationRepository;
    private final EnvironmentVariablesRepository variablesRepository;
    private final BrokerService brokerService;
    private final ConnectionService connectionService;
    private final ConnectionKeysService connectionKeysService;
    private final EncryptionProperties encryptionProperties;
    private final TransactionTemplate transactionTemplate;

    public GatewayConventions(ApplicationProperties applicationProperties, IntegrationRepository integrationRepository,
                              EnvironmentVariablesRepository variablesRepository, BrokerService brokerService,
                              ConnectionService connectionService, ConnectionKeysService connectionKeysService,
                              EncryptionProperties encryptionProperties, PlatformTransactionManager transactionManager) {
        this.applicationProperties = applicationProperties;
        this.integrationRepository = integrationRepository;
        this.variablesRepository = variablesRepository;
        this.brokerService = brokerService;
        this.connectionService = connectionService;
        this.connectionKeysService = connectionKeysService;
        this.encryptionProperties = encryptionProperties;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @PostConstruct
    void init() {
        if (!applicationProperties.getGateway().getFirstStartSetup()) {
            return;
        }
        try {
            transactionTemplate.executeWithoutResult(status -> addMissing());
        } catch (RuntimeException e) {
            // Without them the Gateway still works; the user then adds the Variable or Connection themselves
            log.warn("Could not add the messages Variable or the Gateway broker Connection: {}", e.getMessage(), e);
        }
    }

    void addMissing() {
        Optional<Integration> integration = integrationRepository.findAll().stream().findFirst();
        if (integration.isEmpty()) {
            return;
        }
        if (variablesRepository.findAll().stream().noneMatch(variable -> MESSAGES_VARIABLE.equals(variable.getKey()))) {
            addMessagesVariable(integration.get());
        }
        if (!brokerService.findAll().isEmpty()
                && connectionService.getAll().stream().noneMatch(connection -> BROKER_CONNECTION_TYPE.equalsIgnoreCase(connection.getType()))) {
            addBrokerConnection();
        }
    }

    /** The folder for files, with forward slashes, which a File path takes on every system. */
    static String messagesFolder() {
        return Path.of(System.getProperty("user.home"), "messages").toString().replace('\\', '/');
    }

    private void addMessagesVariable(Integration integration) {
        EnvironmentVariables variable = new EnvironmentVariables();
        variable.setKey(MESSAGES_VARIABLE);
        variable.setValue(messagesFolder());
        variable.setEncrypted(false);
        variable.setIntegration(integration);
        variablesRepository.save(variable);
        log.info("Added the Variable {} = {}", MESSAGES_VARIABLE, variable.getValue());
    }

    /** A pooled Simple JMS Connection to the built-in Artemis broker, with the credentials the tutorials use. */
    private void addBrokerConnection() {
        ConnectionDTO connection = new ConnectionDTO();
        connection.setName(BROKER_CONNECTION);
        connection.setType(BROKER_CONNECTION_TYPE);
        Long connectionId = connectionService.save(connection).getId();

        Map<String, String> keys = new LinkedHashMap<>();
        keys.put("url", "tcp://localhost:61616");
        keys.put("username", "admin");
        keys.put("password", encrypt("admin"));
        keys.put("jmsprovider", "ActiveMQ Artemis");
        keys.put("pooled", "true");
        keys.forEach((key, value) -> {
            ConnectionKeysDTO connectionKey = new ConnectionKeysDTO();
            connectionKey.setConnectionId(connectionId);
            connectionKey.setKey(key);
            connectionKey.setValue(value);
            connectionKeysService.save(connectionKey);
        });
        log.info("Added the Connection {} to the built-in broker", BROKER_CONNECTION);
    }

    /** As ConnectionKeysResource stores a password. */
    private String encrypt(String value) {
        Properties properties = encryptionProperties.getProperties();
        return new EncryptionUtil(properties.getProperty("password"), properties.getProperty("algorithm")).encrypt(value);
    }
}
