package org.assimbly.gateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Every REST controller must be in a Swagger UI group, otherwise it only shows up under "All endpoints".
 */
class OpenApiGroupsConfigurationTest {

    private static final Set<String> NOT_DOCUMENTED = Set.of(
        "ClientForwardController", "WebConfigurerTestController", "ExceptionTranslatorTestController"
    );

    @Test
    void everyRestControllerIsInAGroup() {
        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(RestController.class));

        List<String> controllers = scanner.findCandidateComponents("org.assimbly").stream()
            .map(BeanDefinition::getBeanClassName)
            .map(name -> name.substring(name.lastIndexOf('.') + 1))
            .filter(name -> !NOT_DOCUMENTED.contains(name))
            .toList();

        List<String> ungrouped = controllers.stream()
            .filter(name -> Arrays.stream(OpenApiGroupsConfiguration.ApiGroup.values())
                .noneMatch(group -> group.controllers.contains(name)))
            .toList();

        assertThat(controllers).isNotEmpty();
        assertThat(ungrouped).as("REST controllers that are missing in OpenApiGroupsConfiguration.ApiGroup").isEmpty();
    }
}
