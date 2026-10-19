package org.assimbly.gateway.config.exporting;

import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.domain.Connection;
import org.assimbly.gateway.domain.ConnectionKeys;
import org.assimbly.gateway.domain.EnvironmentVariables;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.Step;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.domain.enumeration.LogLevelType;
import org.assimbly.gateway.domain.enumeration.StepType;
import org.assimbly.gateway.repository.ConnectionKeysRepository;
import org.assimbly.gateway.repository.ConnectionRepository;
import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.assimbly.gateway.repository.StepRepository;
import org.assimbly.util.EncryptionUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathFactory;
import java.io.ByteArrayInputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Export for Fluxygen: the zip Fluxygen imports, one DIL per Flow, with the secrets protected by a passphrase.
 * The database runs with the settings of the Gateway's own H2 database, which let Connection keys have their
 * {@code value} column.
 */
@SpringBootTest(
    classes = GatewayApp.class,
    properties = "spring.datasource.url=jdbc:h2:mem:fluxygen-export;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;NON_KEYWORDS=VALUE"
)
@Transactional
class FluxygenExportTest {

    private static final String PASSPHRASE = "correct horse battery";

    private static final String CONNECTION_PASSWORD = "db-p4ssw0rd!";

    private static final String VARIABLE_SECRET = "s3cr3t-variable-value";

    @Autowired
    private FluxygenExport fluxygenExport;

    @Autowired
    private Export export;

    @Autowired
    private EncryptionProperties encryptionProperties;

    @Autowired
    private ApplicationProperties applicationProperties;

    private String configuredVersion;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private StepRepository stepRepository;

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private ConnectionKeysRepository connectionKeysRepository;

    @Autowired
    private EnvironmentVariablesRepository environmentVariablesRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final XPath xPath = XPathFactory.newInstance().newXPath();

    private Integration integration;

    private Connection connection;

    /** The secrets as this Gateway stores them, encrypted with its key. */
    private final List<String> gatewayCiphertexts = new ArrayList<>();

    @BeforeEach
    void createFlows() {
        // The test configuration names no version; the Gateway's own configuration does.
        configuredVersion = applicationProperties.getInfo().getVersion();
        applicationProperties.getInfo().setVersion("6.0.0-test");

        integration = new Integration();
        integration.setName("fluxygen");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integration = integrationRepository.save(integration);

        connection = new Connection();
        connection.setName("orders-db");
        connection.setType("sql");
        connection = connectionRepository.save(connection);
        connectionKey("password", gatewayEncrypt(CONNECTION_PASSWORD));
        connectionKey("url", "jdbc:postgresql://@{dbHost}/orders");
        connectionKey("username", "@{dbUser}");

        variable("ordersSecret", gatewayEncrypt(VARIABLE_SECRET), true);
        variable("inbox", "/data/@{tenant}/in", false);
    }

    @AfterEach
    void restoreVersion() {
        applicationProperties.getInfo().setVersion(configuredVersion);
    }

    @Test
    void theZipHasAManifestAndOneGrouplessDilPerFlowWithDuplicateNamesSuffixed() throws Exception {
        Flow first = flow("Orders in", true);
        Flow second = flow("Orders in", false);
        Flow third = flow("Orders/in", false);

        Map<String, String> zip = unzip(fluxygenExport.zip(integration.getId(), null, passphrase()));

        assertThat(zip.keySet()).containsExactlyInAnyOrder(
            "manifest.json", "groupless/Orders-in.xml", "groupless/Orders-in-2.xml", "groupless/Orders-in-3.xml");
        for (String file : List.of("groupless/Orders-in.xml", "groupless/Orders-in-2.xml", "groupless/Orders-in-3.xml")) {
            Document dil = parse(zip.get(file));
            assertThat(dil.getDocumentElement().getTagName()).isEqualTo("dil");
            assertThat(xPath.evaluate("count(/dil/integrations/integration/flows/flow)", dil)).isEqualTo("1");
        }
        assertThat(xPath.evaluate("/dil/integrations/integration/flows/flow/name", parse(zip.get("groupless/Orders-in-3.xml"))))
            .isEqualTo("Orders/in");

        JsonNode manifest = objectMapper.readTree(zip.get("manifest.json"));
        assertThat(manifest.get("exportDate").asString()).isNotBlank();
        assertThat(manifest.get("gateway").get("name").asString()).isNotBlank();
        assertThat(manifest.get("gateway").get("version").asString()).isEqualTo("6.0.0-test");
        assertThat(manifest.get("dilVersion").asString()).isEqualTo(xPath.evaluate("/dil/version", parse(zip.get("groupless/Orders-in.xml"))));
        assertThat(manifest.get("secrets").get("protection").asString()).isEqualTo("passphrase");
        assertThat(manifest.get("secrets").get("algorithm").asString()).isEqualTo("PBEWithHMACSHA512AndAES_256");
        List<String> notIncluded = new ArrayList<>();
        manifest.get("notIncluded").forEach(item -> notIncluded.add(item.asString()));
        assertThat(notIncluded)
            .containsExactly("brokers", "queues/topics", "certificates", "users");

        JsonNode flows = manifest.get("flows");
        assertThat(flows.size()).isEqualTo(3);
        List<Long> ids = List.of(first.getId(), second.getId(), third.getId());
        List<String> files = List.of("groupless/Orders-in.xml", "groupless/Orders-in-2.xml", "groupless/Orders-in-3.xml");
        for (int i = 0; i < 3; i++) {
            JsonNode flow = flows.get(i);
            assertThat(flow.get("id").asLong()).isEqualTo(ids.get(i));
            assertThat(flow.get("type").asString()).isEqualTo("flow");
            assertThat(flow.get("file").asString()).isEqualTo(files.get(i));
            assertThat(flow.get("group").asString()).isEqualTo("groupless");
        }
        assertThat(flows.get(2).get("name").asString()).isEqualTo("Orders/in");
    }

    @Test
    void onlyTheChosenFlowsAreExported() throws Exception {
        flow("Orders in", true);
        Flow chosen = flow("Invoices out", false);

        Map<String, String> zip = unzip(fluxygenExport.zip(integration.getId(), List.of(chosen.getId()), passphrase()));

        assertThat(zip.keySet()).containsExactlyInAnyOrder("manifest.json", "groupless/Invoices-out.xml");
    }

    @Test
    void theZipHoldsNoPlaintextSecretAndNoCiphertextOfTheGatewayKey() throws Exception {
        flow("Orders in", true);

        Map<String, String> zip = unzip(fluxygenExport.zip(integration.getId(), null, passphrase()));
        String everything = String.join("\n", zip.values());

        assertThat(everything).doesNotContain(CONNECTION_PASSWORD, VARIABLE_SECRET);
        assertThat(gatewayCiphertexts).noneMatch(everything::contains);
        List<String> ciphertexts = ciphertexts(everything);
        assertThat(ciphertexts).isNotEmpty();
        EncryptionUtil gatewayKey = gatewayKey();
        for (String ciphertext : ciphertexts) {
            assertThat(decryptOrNull(gatewayKey, ciphertext)).isNotIn(CONNECTION_PASSWORD, VARIABLE_SECRET);
        }
    }

    @Test
    void decryptingWithThePassphraseGivesBackTheSecrets() throws Exception {
        flow("Orders in", true);

        Document dil = parse(unzip(fluxygenExport.zip(integration.getId(), null, passphrase())).get("groupless/Orders-in.xml"));
        EncryptionUtil passphraseKey = new EncryptionUtil(PASSPHRASE, FluxygenExport.ALGORITHM);

        String password = xPath.evaluate("/dil/core/connections/connection[name='orders-db']/keys/password", dil);
        assertThat(passphraseKey.decrypt(password)).isEqualTo(CONNECTION_PASSWORD);
        String variable = xPath.evaluate("/dil/core/environmentVariables/environmentVariable[key='ordersSecret']/value", dil);
        assertThat(passphraseKey.decrypt(variable)).isEqualTo(VARIABLE_SECRET);
        assertThat(xPath.evaluate("/dil/core/environmentVariables/environmentVariable[key='ordersSecret']/encrypted", dil)).isEqualTo("true");
    }

    @Test
    void placeholdersAndPlainValuesAreKept() throws Exception {
        flow("Orders in", true);

        Document dil = parse(unzip(fluxygenExport.zip(integration.getId(), null, passphrase())).get("groupless/Orders-in.xml"));

        assertThat(xPath.evaluate("/dil/core/connections/connection/keys/url", dil)).isEqualTo("jdbc:postgresql://@{dbHost}/orders");
        assertThat(xPath.evaluate("/dil/core/connections/connection/keys/username", dil)).isEqualTo("@{dbUser}");
        assertThat(xPath.evaluate("/dil/core/environmentVariables/environmentVariable[key='inbox']/value", dil)).isEqualTo("/data/@{tenant}/in");
        assertThat(xPath.evaluate("//flow/steps/step[type='source']/uri", dil)).isEqualTo("file://@{inbox}");
    }

    @Test
    void theFlowExportOfTheGatewayStillHasTheSecretsEncryptedWithItsKey() throws Exception {
        Flow flow = flow("Orders in", true);
        fluxygenExport.zip(integration.getId(), null, passphrase());

        Document dil = parse(export.convertDBToFlowConfiguration(flow.getId(), "application/xml", false));

        String password = xPath.evaluate("/dil/core/connections/connection/keys/password", dil);
        assertThat(gatewayKey().decrypt(password)).isEqualTo(CONNECTION_PASSWORD);
    }

    @Test
    void aShortPassphraseIsRefusedAndThePassphraseIsClearedAfterwards() throws Exception {
        flow("Orders in", true);
        char[] tooShort = "elevenchars".toCharArray();

        assertThatThrownBy(() -> fluxygenExport.zip(integration.getId(), null, tooShort))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("12");
        assertThat(new String(tooShort)).isEqualTo("\0".repeat(11));

        char[] passphrase = passphrase();
        fluxygenExport.zip(integration.getId(), null, passphrase);
        assertThat(new String(passphrase)).isEqualTo("\0".repeat(PASSPHRASE.length()));
    }

    @Test
    void aFlowOfAnotherIntegrationIsRefused() {
        assertThatThrownBy(() -> fluxygenExport.zip(integration.getId(), List.of(-1L), passphrase()))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void aSafeNameKeepsLettersDigitsDotsDashesAndUnderscores() {
        assertThat(FluxygenExport.safeName("Café to S3 / archive")).isEqualTo("Cafe-to-S3-archive");
        assertThat(FluxygenExport.safeName("../../etc/passwd")).isEqualTo("etc-passwd");
        assertThat(FluxygenExport.safeName("my_flow.v2")).isEqualTo("my_flow.v2");
        assertThat(FluxygenExport.safeName("???")).isEqualTo("flow");
        assertThat(FluxygenExport.safeName(null)).isEqualTo("flow");
    }

    private Flow flow(String name, boolean withConnection) {
        Flow flow = new Flow();
        flow.setName(name);
        flow.setType("flow");
        flow.setIntegration(integration);
        flow.setVersion(1);
        flow.setAutoStart(false);
        flow.setLogLevel(LogLevelType.OFF);
        flow.setCreated(Instant.now());
        flow.setLastModified(Instant.now());
        flow = flowRepository.save(flow);

        Step source = new Step();
        source.setStepType(StepType.SOURCE);
        source.setComponentType("file");
        source.setUri("@{inbox}");
        if (withConnection) {
            source.setConnection(connection);
        }
        flow.addStep(source);
        stepRepository.save(source);
        return flow;
    }

    private void connectionKey(String key, String value) {
        ConnectionKeys connectionKey = new ConnectionKeys();
        connectionKey.setKey(key);
        connectionKey.setValue(value);
        connectionKey.setType("string");
        connection.addConnectionKeys(connectionKey);
        connectionKeysRepository.save(connectionKey);
    }

    private void variable(String key, String value, boolean encrypted) {
        EnvironmentVariables variable = new EnvironmentVariables();
        variable.setKey(key);
        variable.setValue(value);
        variable.setEncrypted(encrypted);
        variable.setIntegration(integration);
        environmentVariablesRepository.save(variable);
    }

    private String gatewayEncrypt(String value) {
        String ciphertext = gatewayKey().encrypt(value);
        gatewayCiphertexts.add(ciphertext);
        return ciphertext;
    }

    private EncryptionUtil gatewayKey() {
        Properties key = encryptionProperties.getProperties();
        return new EncryptionUtil(key.getProperty("password"), key.getProperty("algorithm"));
    }

    private static char[] passphrase() {
        return PASSPHRASE.toCharArray();
    }

    /** What the key makes of the ciphertext; null when it can't decrypt it. A wrong key may now and then decrypt to garbage. */
    private static String decryptOrNull(EncryptionUtil key, String ciphertext) {
        try {
            return key.decrypt(ciphertext);
        } catch (Exception e) {
            return null;
        }
    }

    private static List<String> ciphertexts(String text) {
        Matcher matcher = Pattern.compile(EncryptionUtil.ENCODE_PREFIX_REGEX).matcher(text);
        List<String> found = new ArrayList<>();
        while (matcher.find()) {
            found.add(matcher.group());
        }
        return found;
    }

    private static Map<String, String> unzip(byte[] zip) throws Exception {
        Map<String, String> entries = new LinkedHashMap<>();
        try (ZipInputStream in = new ZipInputStream(new ByteArrayInputStream(zip), StandardCharsets.UTF_8)) {
            for (ZipEntry entry = in.getNextEntry(); entry != null; entry = in.getNextEntry()) {
                entries.put(entry.getName(), new String(in.readAllBytes(), StandardCharsets.UTF_8));
            }
        }
        return entries;
    }

    private static Document parse(String xml) throws Exception {
        return DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
    }
}
