package org.assimbly.gateway.service.api;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ApiPathsTest {

    @Test
    void fullPathJoinsBasePathAndPathWithoutDoubleOrTrailingSlashes() {
        assertThat(ApiPaths.fullPath("/customers", "/{id}")).isEqualTo("/customers/{id}");
        assertThat(ApiPaths.fullPath("/customers/", "/")).isEqualTo("/customers");
        assertThat(ApiPaths.fullPath("/", "/")).isEqualTo("/");
        assertThat(ApiPaths.fullPath("//shop//", "orders//{id}/")).isEqualTo("/shop/orders/{id}");
    }

    @Test
    void templatesThatDifferOnlyInParameterNamesHaveTheSameConflictKey() {
        assertThat(ApiPaths.conflictKey("get", "/c/{id}")).isEqualTo(ApiPaths.conflictKey("GET", "/c/{key}"));
        assertThat(ApiPaths.conflictKey("GET", "/c/{id}")).isNotEqualTo(ApiPaths.conflictKey("POST", "/c/{id}"));
        assertThat(ApiPaths.conflictKey("GET", "/c/{id}")).isNotEqualTo(ApiPaths.conflictKey("GET", "/c/{id}/items"));
    }

    @Test
    void pathParametersAreReadFromTheTemplateInOrder() {
        assertThat(ApiPaths.pathParameterNames("/customers/{customerId}/orders/{orderId}")).containsExactly("customerId", "orderId");
        assertThat(ApiPaths.pathParameterNames("/customers")).isEmpty();
    }

    @Test
    void aBasePathStartsWithASlashAndHasNoParameters() {
        assertThatThrownBy(() -> ApiPaths.checkBasePath("customers")).hasMessageContaining("start with /");
        assertThatThrownBy(() -> ApiPaths.checkBasePath("/customers/{id}")).hasMessageContaining("parameters");
        ApiPaths.checkBasePath("/customers");
    }

    @Test
    void aPathTemplateStartsWithASlashAndNamesEachParameterOnce() {
        assertThatThrownBy(() -> ApiPaths.checkPath("customers")).hasMessageContaining("start with /");
        assertThatThrownBy(() -> ApiPaths.checkPath("/c/{id}/{id}")).hasMessageContaining("id");
        assertThatThrownBy(() -> ApiPaths.checkPath("/c/{}")).hasMessageContaining("name");
        assertThatThrownBy(() -> ApiPaths.checkPath("/c/{id")).hasMessageContaining("{");
        ApiPaths.checkPath("/");
        ApiPaths.checkPath("/c/{id}");
    }

    @Test
    void theRuntimePathCarriesTheTenantPrefixWhenATenantIsSet() {
        assertThat(ApiPaths.runtimePath(null, "/customers/{id}")).isEqualTo("/customers/{id}");
        assertThat(ApiPaths.runtimePath("", "/customers")).isEqualTo("/customers");
        assertThat(ApiPaths.runtimePath("acme", "/customers")).isEqualTo("/_acme/customers");
        assertThat(ApiPaths.runtimePath("_acme", "/")).isEqualTo("/_acme");
    }
}
