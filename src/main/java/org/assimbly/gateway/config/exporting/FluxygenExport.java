package org.assimbly.gateway.config.exporting;

import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.util.EncryptionUtil;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Instant;
import java.util.*;
import java.util.function.UnaryOperator;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Export for Fluxygen: the Flows of an Integration as a zip that Fluxygen imports, one DIL file per Flow in the
 * {@code groupless} group, with a {@code manifest.json}. The secrets in it are encrypted with a passphrase the user
 * chooses instead of this Gateway's key, so Fluxygen can read them once the user types the passphrase on import.
 * Placeholders such as {@code @{key}} stay as they are.
 */
@Service
public class FluxygenExport {

    public static final String ALGORITHM = "PBEWithHMACSHA512AndAES_256";

    public static final int MIN_PASSPHRASE_LENGTH = 12;

    public static final String GROUP = "groupless";

    public static final String MANIFEST = "manifest.json";

    static final List<String> NOT_INCLUDED = List.of("brokers", "queues/topics", "certificates", "users");

    private final ExportXML exportXML;

    private final FlowRepository flowRepository;

    private final EncryptionProperties encryptionProperties;

    private final ApplicationProperties applicationProperties;

    private final ObjectMapper objectMapper;

    public FluxygenExport(
        ExportXML exportXML,
        FlowRepository flowRepository,
        EncryptionProperties encryptionProperties,
        ApplicationProperties applicationProperties,
        ObjectMapper objectMapper
    ) {
        this.exportXML = exportXML;
        this.flowRepository = flowRepository;
        this.encryptionProperties = encryptionProperties;
        this.applicationProperties = applicationProperties;
        this.objectMapper = objectMapper;
    }

    /**
     * The zip of the given Flows of the Integration, or of all its Flows when {@code flowIds} is null or empty.
     * The passphrase is cleared afterwards, also when the export fails; it is never logged or stored.
     *
     * @throws IllegalArgumentException when the passphrase is shorter than {@value #MIN_PASSPHRASE_LENGTH}
     * characters or a Flow isn't one of the Integration's
     */
    public synchronized byte[] zip(Long integrationId, List<Long> flowIds, char[] passphrase) throws Exception {
        try {
            if (passphrase == null || passphrase.length < MIN_PASSPHRASE_LENGTH) {
                throw new IllegalArgumentException("The passphrase must be at least " + MIN_PASSPHRASE_LENGTH + " characters.");
            }
            List<Flow> flows = flowsToExport(integrationId, flowIds);
            UnaryOperator<String> secretMapper = secretMapper(passphrase);

            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            List<Map<String, Object>> manifestFlows = new ArrayList<>();
            Set<String> files = new HashSet<>();
            try (ZipOutputStream zip = new ZipOutputStream(bytes, StandardCharsets.UTF_8)) {
                for (Flow flow : flows) {
                    // ExportXML keeps the Flow it builds in its fields, so the Flows are exported one after the other.
                    String dil = exportXML.getXMLFlowConfiguration(flow.getId(), secretMapper);
                    String file = GROUP + "/" + uniqueName(safeName(flow.getName()), files) + ".xml";
                    put(zip, file, dil.getBytes(StandardCharsets.UTF_8));

                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("id", flow.getId());
                    entry.put("name", flow.getName());
                    entry.put("type", flow.getType());
                    entry.put("file", file);
                    entry.put("group", GROUP);
                    manifestFlows.add(entry);
                }
                put(zip, MANIFEST, objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(manifest(manifestFlows)));
            }
            return bytes.toByteArray();
        } finally {
            if (passphrase != null) {
                Arrays.fill(passphrase, '\0');
            }
        }
    }

    private List<Flow> flowsToExport(Long integrationId, List<Long> flowIds) {
        List<Flow> flows = new ArrayList<>(flowRepository.findAllByIntegrationId(integrationId));
        flows.sort(Comparator.comparing(Flow::getId));
        if (flowIds == null || flowIds.isEmpty()) {
            return flows;
        }
        Set<Long> wanted = new LinkedHashSet<>(flowIds);
        List<Flow> chosen = flows.stream().filter(flow -> wanted.contains(flow.getId())).toList();
        if (chosen.size() != wanted.size()) {
            throw new IllegalArgumentException("Not every Flow to export belongs to integration " + integrationId + ".");
        }
        return chosen;
    }

    /** Decrypts a secret with this Gateway's key and encrypts it again with the passphrase. */
    private UnaryOperator<String> secretMapper(char[] passphrase) {
        Properties gatewayKey = encryptionProperties.getProperties();
        EncryptionUtil gateway = new EncryptionUtil(gatewayKey.getProperty("password"), gatewayKey.getProperty("algorithm"));
        // EncryptionUtil only takes the passphrase as a String; it lives as long as this export.
        EncryptionUtil export = new EncryptionUtil(new String(passphrase), ALGORITHM);
        return value -> {
            if (isPlaceholder(value)) {
                return value;
            }
            String plain;
            try {
                plain = isEncrypted(value) ? gateway.decrypt(value) : value;
            } catch (RuntimeException e) {
                // Not the cause: its message could hold the value.
                throw new IllegalStateException("A secret could not be decrypted with this Gateway's key.");
            }
            return export.encrypt(plain);
        };
    }

    private static boolean isEncrypted(String value) {
        return value.startsWith(EncryptionUtil.ENCODE_PREFIX) && value.endsWith(EncryptionUtil.ENCODE_SUFFIX);
    }

    /** A secret that is only a placeholder, such as {@code @{password}}, holds nothing to protect. */
    private static boolean isPlaceholder(String value) {
        return value.matches("@\\{[^}]+}");
    }

    private Map<String, Object> manifest(List<Map<String, Object>> flows) {
        Map<String, Object> gateway = new LinkedHashMap<>();
        gateway.put("name", gatewayName());
        gateway.put("version", applicationProperties.getInfo().getVersion());

        Map<String, Object> secrets = new LinkedHashMap<>();
        secrets.put("protection", "passphrase");
        secrets.put("algorithm", ALGORITHM);

        Map<String, Object> manifest = new LinkedHashMap<>();
        manifest.put("exportDate", Instant.now().toString());
        manifest.put("gateway", gateway);
        // The DIL carries the Gateway version as its own version.
        manifest.put("dilVersion", applicationProperties.getInfo().getVersion());
        manifest.put("format", "xml");
        manifest.put("secrets", secrets);
        manifest.put("flows", flows);
        manifest.put("notIncluded", NOT_INCLUDED);
        return manifest;
    }

    /** A file name made of letters, digits, dot, dash and underscore; "flow" when nothing of the name is left. */
    static String safeName(String name) {
        String ascii = Normalizer.normalize(name == null ? "" : name, Normalizer.Form.NFKD).replaceAll("\\p{M}", "");
        String safe = ascii.trim().replaceAll("[^A-Za-z0-9._-]+", "-").replaceAll("-{2,}", "-").replaceAll("^[-.]+|[-.]+$", "");
        if (safe.length() > 100) {
            safe = safe.substring(0, 100);
        }
        return safe.isEmpty() ? "flow" : safe;
    }

    /** The name, or the name with -2, -3, … when an earlier Flow has it already. File names are compared ignoring case. */
    private static String uniqueName(String name, Set<String> taken) {
        String candidate = name;
        for (int i = 2; !taken.add(candidate.toLowerCase(Locale.ROOT)); i++) {
            candidate = name + "-" + i;
        }
        return candidate;
    }

    private static void put(ZipOutputStream zip, String name, byte[] content) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(content);
        zip.closeEntry();
    }

    /** The name of the zip: assimbly-to-fluxygen-&lt;gateway&gt;-&lt;date&gt;.zip. */
    public String fileName(String date) {
        return "assimbly-to-fluxygen-" + safeName(gatewayName()) + "-" + date + ".zip";
    }

    /** The Gateway's name; "default", as the Gateway is called when none is configured. */
    private String gatewayName() {
        String name = applicationProperties.getGateway().getName();
        return name == null || name.isBlank() ? "default" : name;
    }
}
