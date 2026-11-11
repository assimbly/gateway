package org.assimbly.gateway.service.api;

import org.assimbly.util.CertificatesUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import javax.net.ssl.X509TrustManager;
import java.net.URI;
import java.nio.file.Path;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ApiTryServiceTest {

    private static final String PASSWORD = "test-password";

    @Test
    void callsTheOperationsOwnPathOnTheRuntimeWithTheParametersFilledIn() {
        Map<String, String> query = new LinkedHashMap<>();
        query.put("limit", "10");
        query.put("q", "a b&c");

        URI uri = ApiTryService.target("https://localhost:9001", "/_acme/customers/{id}/orders/{orderId}",
            Map.of("id", "4 2", "orderId", "x/y"), query);

        assertThat(uri.toString()).isEqualTo("https://localhost:9001/_acme/customers/4%202/orders/x%2Fy?limit=10&q=a%20b%26c");
    }

    @Test
    void aPathParameterCantLeaveTheOperationsPath() {
        assertThatThrownBy(() -> ApiTryService.target("https://localhost:9001", "/customers/{id}", Map.of("id", ".."), Map.of()))
            .isInstanceOf(ApiRuleException.class);
        assertThatThrownBy(() -> ApiTryService.target("https://localhost:9001", "/customers/{id}", Map.of(), Map.of()))
            .isInstanceOf(ApiRuleException.class)
            .hasMessageContaining("id");
    }

    @Test
    void theListenerUrlKeepsItsOwnHostWhateverTheParametersSay() {
        URI uri = ApiTryService.target("https://localhost:9001/", "/c/{id}", Map.of("id", "@evil.example.com"), Map.of());

        assertThat(uri.getHost()).isEqualTo("localhost");
        assertThat(uri.getPort()).isEqualTo(9001);
    }

    @Test
    void trustsTheRuntimesOwnIdentityButNoOtherSelfSignedCertificate(@TempDir Path folder) throws Exception {
        X509Certificate identity = generateIdentity(folder.resolve("server-identity.p12"));
        X509Certificate stranger = generateIdentity(folder.resolve("stranger.p12"));

        X509TrustManager trust = (X509TrustManager) ApiTryService.listenerTrustManagers(folder.resolve("server-identity.p12"), PASSWORD)[0];

        assertThatCode(() -> trust.checkServerTrusted(new X509Certificate[] {identity}, "RSA")).doesNotThrowAnyException();
        assertThatThrownBy(() -> trust.checkServerTrusted(new X509Certificate[] {stranger}, "RSA"))
            .isInstanceOf(CertificateException.class);
    }

    @Test
    void leavesAMissingIdentityStoreForTheRuntimeToCreate(@TempDir Path folder) throws Exception {
        Path identityStore = folder.resolve("server-identity.p12");

        assertThat(ApiTryService.listenerTrustManagers(identityStore, PASSWORD)).isNotEmpty();
        assertThat(identityStore).doesNotExist();
    }

    private static X509Certificate generateIdentity(Path keystore) throws Exception {
        return (X509Certificate) CertificatesUtil.generateIdentity(keystore.toString(), PASSWORD, "localhost", null).values().iterator().next();
    }
}
