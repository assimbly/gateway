package org.assimbly.gateway.config;

import org.springdoc.core.customizers.ActuatorOpenApiCustomizer;
import org.springdoc.core.customizers.ActuatorOperationCustomizer;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.utils.Constants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tech.jhipster.config.JHipsterProperties;

import java.util.List;
import java.util.Set;

/**
 * Splits the Swagger UI into groups that can be selected in its top bar dropdown. Each group is served at
 * {@code /v3/api-docs/{id}}; the default group (all of {@code /api/**}) and JHipster's {@code management} group stay.
 * <p>
 * Controllers are matched by simple class name, so the controllers of the runtime jars and the headless variants
 * of the gateway resources are covered without compile time references. Tag names can't be used, because some
 * are shared by controllers of different groups (like Messages and Certificates).
 */
@Configuration
public class OpenApiGroupsConfiguration {

    /** The groups, in the order of the dropdown (see {@link SwaggerUiGroupsOrderAdvice}). */
    enum ApiGroup {
        INTEGRATION("integration", "Integration runtime", Set.of(
            "FlowConfigurerRuntime", "FlowManagerRuntime", "CacheManagerRuntime", "IntegrationRuntime",
            "MessageManagerRuntime", "ValidationRuntime"
        )),
        BROKER("broker", "Broker runtime", Set.of(
            "BrokerConfigurerRuntime", "BrokerManagerRuntime", "MessageBrokerRuntime", "QueueManagerRuntime",
            "TopicManagerRuntime"
        )),
        CONFIGURATION("configuration", "Configuration", Set.of(
            "AccountResource", "AccountDBResource", "ApplicationInfoResource", "ProfileInfoResource",
            "AuthenticateController", "UserJWTController", "EnvironmentResource",
            "CertificateManagerRuntime", "JDBCResource", "LlmProviderRuntime", "OAuth2Resource",
            "AuthenticatorResource", "UserResource", "PublicUserResource", "EmailResource"
        )),
        RESOURCES("resources", "Resources", Set.of(
            "ConnectionKeysResource", "ConnectionResource", "EnvironmentVariablesResource", "FlowResource",
            "HeaderResource", "IntegrationResource", "LinkResource", "RouteResource", "StepResource",
            "MessageResource", "BrokerResource", "QueueResource", "TopicResource", "CertificateResource", "ApiResource"
        )),
        OBSERVABILITY("observability", "Observability", Set.of(
            "StatisticsRuntime", "HealthRuntime", "HealthIntegrationRuntime", "HealthBrokerResource",
            "LogsResource", "AuditResource"
        ));

        final String id;
        final String label;
        final Set<String> controllers;

        ApiGroup(String id, String label, Set<String> controllers) {
            this.id = id;
            this.label = label;
            this.controllers = controllers;
        }

        boolean contains(Class<?> controller) {
            return controllers.contains(controller.getSimpleName());
        }
    }

    private final List<OpenApiCustomizer> openApiCustomizers;
    private final List<OperationCustomizer> operationCustomizers;

    public OpenApiGroupsConfiguration(List<OpenApiCustomizer> openApiCustomizers, List<OperationCustomizer> operationCustomizers) {
        this.openApiCustomizers = openApiCustomizers;
        this.operationCustomizers = operationCustomizers;
    }

    @Bean
    public GroupedOpenApi configurationGroupedOpenApi() {
        return group(ApiGroup.CONFIGURATION);
    }

    @Bean
    public GroupedOpenApi integrationGroupedOpenApi() {
        return group(ApiGroup.INTEGRATION);
    }

    @Bean
    public GroupedOpenApi brokerGroupedOpenApi() {
        return group(ApiGroup.BROKER);
    }

    @Bean
    public GroupedOpenApi resourcesGroupedOpenApi() {
        return group(ApiGroup.RESOURCES);
    }

    @Bean
    public GroupedOpenApi observabilityGroupedOpenApi() {
        return group(ApiGroup.OBSERVABILITY);
    }

    /** Replaces JHipster's default group (same paths), only to give it a readable name in the dropdown. */
    @Bean
    public GroupedOpenApi openAPIDefaultGroupedOpenAPI(JHipsterProperties jHipsterProperties) {
        return withCustomizers(GroupedOpenApi.builder()
            .group(Constants.DEFAULT_GROUP_NAME)
            .displayName("All endpoints")
            .pathsToMatch(jHipsterProperties.getApiDocs().getDefaultIncludePattern()));
    }

    private GroupedOpenApi group(ApiGroup group) {
        return withCustomizers(GroupedOpenApi.builder()
            .group(group.id)
            .displayName(group.label)
            .addOpenApiMethodFilter(method -> group.contains(method.getDeclaringClass())));
    }

    /** Like JHipster's default group, the global (non actuator) customizers are added, so examples keep showing. */
    @SuppressWarnings("deprecation")
    private GroupedOpenApi withCustomizers(GroupedOpenApi.Builder builder) {
        openApiCustomizers.stream()
            .filter(customizer -> !(customizer instanceof ActuatorOpenApiCustomizer))
            .forEach(builder::addOpenApiCustomizer);
        operationCustomizers.stream()
            .filter(customizer -> !(customizer instanceof ActuatorOperationCustomizer))
            .forEach(builder::addOperationCustomizer);
        return builder.build();
    }
}
