package org.assimbly.gateway.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.swagger.v3.core.util.Json;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springdoc.core.customizers.ParameterCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Collection;
import java.util.Map;

import static java.util.Map.entry;

/**
 * Swagger UI documentation of the gateway REST resources that doesn't fit on the resources themselves:
 * the description and example of parameters and of request bodies. Only applies to
 * {@code org.assimbly.gateway.web.rest}, so it doesn't touch the resources of the runtime jars.
 * <p>
 * Parameters are looked up as {@code Resource.method.name}, {@code Resource.name} and {@code name}, most specific
 * first. Bodies are looked up by method name (String bodies) or by DTO class (JSON bodies, where an update also
 * gets an id). An explicit {@code @Parameter} on a method wins.
 */
@Configuration
public class OpenApiDocsConfiguration {

    private static final String REST_PACKAGE = "org.assimbly.gateway.web.rest";

    private record Doc(String description, Object example) {}

    private static final Map<String, Doc> PARAMETERS = Map.ofEntries(
        entry("BrokerResource.id", new Doc("Id of the broker", 1)),
        entry("QueueResource.id", new Doc("Id of the queue", 1)),
        entry("TopicResource.id", new Doc("Id of the topic", 1)),
        entry("CertificateResource.id", new Doc("Id of the certificate", 1)),
        entry("EnvironmentVariablesResource.id", new Doc("Id of the environment variable", 1)),
        entry("IntegrationResource.id", new Doc("Id of the integration", 1)),
        entry("ConnectionKeysResource.id", new Doc("Id of the connection key", 1)),
        entry("ConnectionResource.id", new Doc("Id of the connection", 1)),
        entry("FlowResource.id", new Doc("Id of the flow", 1)),
        entry("HeaderResource.id", new Doc("Id of the header", 1)),
        entry("LinkResource.id", new Doc("Id of the link", 1)),
        entry("MessageResource.id", new Doc("Id of the message", 1)),
        entry("RouteResource.id", new Doc("Id of the route", 1)),
        entry("StepResource.id", new Doc("Id of the step", 1)),
        entry("StepResource.getStepByFlowID.id", new Doc("Id of the flow", 1)),
        entry("AuditResource.id", new Doc("Id of the audit event", 1)),
        entry("OAuth2Resource.id", new Doc("Id of the OAuth2 connection", "1")),
        entry("integrationid", new Doc("Id of the integration", 1)),
        entry("flowid", new Doc("Id of the flow", 1)),
        entry("stepid", new Doc("Id of the step", 1)),
        entry("login", new Doc("Login of the user", "admin")),
        entry("lines", new Doc("Number of log lines", 100)),
        entry("certificateName", new Doc("Alias of the certificate", "example.com")),
        entry("withinNumberOfDays", new Doc("Number of days until expiry", 30)),
        entry("fromDate", new Doc("First day (inclusive)", "2026-01-01")),
        entry("toDate", new Doc("Last day (inclusive)", "2026-12-31")),
        entry("key", new Doc("Activation key from the registration mail", "1234567890")),
        entry("PlaceholderReplacement", new Doc("Replace placeholders with their values", true)),
        entry("offset", new Doc("Number of newest alerts to skip", 0)),
        entry("limit", new Doc("Page size (max 10)", 10)),
        entry("Authorization", new Doc("Bearer token of the logged in user", "Bearer eyJhbGciOiJIUzUxMiJ9...")),
        entry("authorization", new Doc("Bearer token of the logged in user", "Bearer eyJhbGciOiJIUzUxMiJ9...")),
        entry("tenant", new Doc("Tenant name", "default")),
        entry("code", new Doc("Authorization code returned by the provider", "4/0AX4XfW...")),
        entry("domainName", new Doc("Name shown in the authenticator app", "gateway.example.com")),
        entry("type", new Doc("Database type", "mysql")),
        entry("user", new Doc("Database user", "root")),
        entry("pwd", new Doc("Database password", "secret")),
        entry("host", new Doc("Database host", "localhost")),
        entry("port", new Doc("Database port", 3306)),
        entry("instance", new Doc("Database instance (SQL Server / Informix only)", "")),
        entry("database", new Doc("Database name", "mydb")),
        entry("useSSL", new Doc("Connect over TLS", false)),
        entry("enabledTLSProtocols", new Doc("Comma separated TLS protocols", "TLSv1.3"))
    );

    /** Example bodies of entities (without id) and other JSON objects, keyed by class name. */
    private static final Map<String, String> ENTITY_BODIES = Map.ofEntries(
        entry("BrokerDTO", "{\"name\":\"Broker\",\"type\":\"classic\",\"configurationType\":\"file\",\"autoStart\":false}"),
        entry("CertificateDTO", "{\"url\":\"https://example.com\",\"certificateName\":\"example.com\",\"certificateStore\":\"outbound-truststore.p12\",\"certificateFile\":\"-----BEGIN CERTIFICATE-----\\nMIIC...\\n-----END CERTIFICATE-----\"}"),
        entry("ConnectionDTO", "{\"name\":\"ActiveMQ\"}"),
        entry("ConnectionKeysDTO", "{\"key\":\"host\",\"value\":\"localhost\",\"connectionId\":1}"),
        entry("EnvironmentVariablesDTO", "{\"key\":\"API_URL\",\"value\":\"https://example.com\",\"encrypted\":false,\"integrationId\":1}"),
        entry("FlowDTO", "{\"name\":\"Scheduler\",\"type\":\"esb\",\"autoStart\":false,\"maximumRedeliveries\":0,\"redeliveryDelay\":0,\"loadBalancing\":false,\"parallelProcessing\":false,\"logLevel\":\"INFO\",\"instances\":1,\"version\":1,\"integrationId\":1}"),
        entry("HeaderDTO", "{\"key\":\"test\",\"value\":\"hello\",\"type\":\"header\",\"language\":\"constant\",\"messageId\":1}"),
        entry("IntegrationDTO", "{\"name\":\"Default\",\"type\":\"FULL\",\"environmentName\":\"dev\",\"stage\":\"DEVELOPMENT\",\"defaultFromComponentType\":\"file\",\"defaultToComponentType\":\"file\",\"defaultErrorComponentType\":\"file\",\"connectorType\":\"CAMEL\"}"),
        entry("LinkDTO", "{\"name\":\"link\",\"bound\":\"out\",\"transport\":\"sync\",\"stepId\":1}"),
        entry("MessageDTO", "{\"name\":\"Message\",\"body\":\"Hello world\",\"language\":\"constant\"}"),
        entry("QueueDTO", "{\"itemsOnPage\":10,\"refreshInterval\":5000,\"selectedColumn\":\"name\",\"orderColumn\":\"name\"}"),
        entry("TopicDTO", "{\"itemsOnPage\":10,\"refreshInterval\":5000,\"selectedColumn\":\"name\",\"orderColumn\":\"name\"}"),
        entry("RouteDTO", "{\"name\":\"route1\",\"content\":\"<route id=\\\"route1\\\"><from uri=\\\"timer:demo\\\"/><to uri=\\\"log:demo\\\"/></route>\"}"),
        entry("StepDTO", "{\"name\":\"Timer\",\"stepType\":\"SOURCE\",\"componentType\":\"quartz\",\"uri\":\"quartz:timer\",\"options\":\"{\\\"cron\\\":\\\"0 * * * * ?\\\"}\",\"flowId\":1}")
    );

    private static final Map<String, String> OTHER_BODIES = Map.ofEntries(
        entry("LoginVM", "{\"username\":\"admin\",\"password\":\"admin\",\"rememberMe\":false}"),
        entry("ManagedUserVM", "{\"login\":\"john\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"langKey\":\"en\",\"password\":\"secret\"}"),
        entry("AdminUserDTO", "{\"login\":\"john\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"activated\":true,\"langKey\":\"en\",\"authorities\":[\"ROLE_USER\"]}"),
        entry("UserDTO", "{\"login\":\"john\"}"),
        entry("PasswordChangeDTO", "{\"currentPassword\":\"secret\",\"newPassword\":\"secret2\"}"),
        entry("KeyAndPasswordVM", "{\"key\":\"1234567890\",\"newPassword\":\"secret2\"}"),
        entry("LoggerVM", "{\"name\":\"org.assimbly\",\"level\":\"DEBUG\"}"),
        entry("EmailRequest", "{\"protocol\":\"smtp\",\"host\":\"smtp.example.com\",\"port\":587,\"from\":\"noreply@example.com\",\"to\":\"john@example.com\",\"username\":\"noreply@example.com\",\"password\":\"secret\",\"subject\":\"Test\",\"body\":\"Hello world\",\"contentType\":\"text/plain\"}")
    );

    /** Example bodies of endpoints that take a plain String, keyed by method name. */
    private static final Map<String, Doc> STRING_BODIES = Map.ofEntries(
        entry("setGatewayConfiguration", new Doc("Integration configuration as XML or JSON", null)),
        entry("setFlowConfiguration", new Doc("Flow configuration as XML or JSON", null)),
        entry("getConfigurationByFlowids", new Doc("Comma separated flow ids", "1,2")),
        entry("getCertificatesByUrl", new Doc("URL to get the certificates from", "https://example.com")),
        entry("removeByUrl", new Doc("URL to remove the certificates of", "https://example.com")),
        entry("requestPasswordReset", new Doc("Email address of the account", "john@example.com")),
        entry("validateTwoFactorAuthentication", new Doc("Email and one-time token", "{\"email\":\"john@example.com\",\"token\":123456}"))
    );

    @Bean
    public ParameterCustomizer gatewayParameterDocs() {
        return (parameter, methodParameter) -> {
            if (parameter == null || !isGatewayResource(methodParameter.getContainingClass())) {
                return parameter;
            }
            Doc doc = findDoc(methodParameter, parameter.getName());
            if (doc != null) {
                if (parameter.getDescription() == null) parameter.setDescription(doc.description());
                if (parameter.getExample() == null && parameter.getExamples() == null) parameter.setExample(doc.example());
            }
            return parameter;
        };
    }

    @Bean
    public OperationCustomizer gatewayBodyDocs() {
        return (operation, handlerMethod) -> {
            var requestBody = operation.getRequestBody();
            if (requestBody == null || requestBody.getContent() == null || !isGatewayResource(handlerMethod.getBeanType())) {
                return operation;
            }
            for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
                if (!parameter.hasParameterAnnotation(RequestBody.class)) continue;
                Doc doc = bodyDoc(handlerMethod.getMethod().getName(), parameter);
                if (doc != null) {
                    if (doc.description() != null) requestBody.setDescription(doc.description());
                    if (doc.example() != null) requestBody.getContent().values().forEach(media -> media.setExample(doc.example()));
                }
            }
            return operation;
        };
    }

    private static boolean isGatewayResource(Class<?> type) {
        return type != null && type.getName().startsWith(REST_PACKAGE);
    }

    private static Doc findDoc(MethodParameter parameter, String name) {
        String resource = parameter.getContainingClass().getSimpleName();
        String method = parameter.getMethod() == null ? "" : parameter.getMethod().getName();
        for (String key : new String[] {resource + "." + method + "." + name, resource + "." + name, name}) {
            Doc doc = PARAMETERS.get(key);
            if (doc != null) return doc;
        }
        return null;
    }

    private static Doc bodyDoc(String method, MethodParameter parameter) {
        Doc plain = STRING_BODIES.get(method);
        if (plain != null) return plain;

        boolean list = Collection.class.isAssignableFrom(parameter.getParameterType());
        String type = (list ? parameter.nested().getNestedParameterType() : parameter.getParameterType()).getSimpleName();
        String json = ENTITY_BODIES.get(type);
        boolean entity = json != null;
        if (!entity) json = OTHER_BODIES.get(type);
        if (json == null) return null;

        try {
            JsonNode node = Json.mapper().readTree(json);
            if (entity && method.startsWith("update")) {
                node = ((ObjectNode) node).put("id", 1);
            }
            if (list) {
                ArrayNode array = Json.mapper().createArrayNode();
                array.add(node);
                node = array;
            }
            return new Doc(null, node);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
