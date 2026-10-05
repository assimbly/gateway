package org.assimbly.gateway.service.api;

import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.service.dto.ApiHandlerDTO;
import org.springframework.stereotype.Service;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.X509ExtendedTrustManager;
import java.io.IOException;
import java.net.Socket;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Try it: sends a request to an Operation through its real path on the runtime's REST listener, from the Gateway,
 * so the browser needn't trust the runtime's certificate or deal with CORS. It only ever calls the Operation's own
 * path on the configured listener, never a URL from the request.
 */
@Service
public class ApiTryService {

    private static final Pattern PARAMETER = Pattern.compile("\\{([^}/]*)}");
    private static final Set<String> HOP_BY_HOP = Set.of("host", "content-length", "connection", "upgrade", "transfer-encoding", "expect", "keep-alive", "te", "trailer");
    private static final Duration TIMEOUT = Duration.ofSeconds(30);

    /** What the user filled in on the Try it form. */
    public record TryRequest(Map<String, String> pathParameters, Map<String, String> query, Map<String, String> headers, String body) {
    }

    /** What the Operation answered. */
    public record TryResponse(int status, Map<String, String> headers, String body, long durationMillis, String url) {
    }

    private final ApiService apiService;
    private final ApplicationProperties applicationProperties;

    public ApiTryService(ApiService apiService, ApplicationProperties applicationProperties) {
        this.apiService = apiService;
        this.applicationProperties = applicationProperties;
    }

    public TryResponse send(Long apiId, Long operationId, TryRequest request) {
        var operation = apiService.findOperation(apiId, operationId).orElseThrow(() -> new ApiRuleException("The API " + apiId + " has no Operation " + operationId + "."));
        ApiHandlerDTO handler = apiService.handlerOf(operation.handlerFlowId()).orElseThrow();

        URI target = target(applicationProperties.getGateway().getRestListenerUrl(), handler.runtimePath(),
            orEmpty(request.pathParameters()), orEmpty(request.query()));

        HttpRequest.Builder builder = HttpRequest.newBuilder(target).timeout(TIMEOUT);
        orEmpty(request.headers()).forEach((name, value) -> {
            if (!name.isBlank() && !HOP_BY_HOP.contains(name.toLowerCase(Locale.ROOT))) {
                builder.header(name, value);
            }
        });
        String body = request.body();
        builder.method(operation.method(), body == null || body.isEmpty() ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));

        long started = System.nanoTime();
        try (HttpClient client = HttpClient.newBuilder().sslContext(trustingContext()).connectTimeout(Duration.ofSeconds(5)).build()) {
            HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            Map<String, String> headers = new LinkedHashMap<>();
            response.headers().map().forEach((name, values) -> headers.put(name, String.join(", ", values)));
            return new TryResponse(response.statusCode(), headers, response.body(), (System.nanoTime() - started) / 1_000_000, target.toString());
        } catch (IOException e) {
            throw new ApiRuleException("The runtime didn't answer on " + target + ": " + e.getMessage()
                + ". Is the Handler Flow running?");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiRuleException("The request to " + target + " was interrupted.");
        }
    }

    /**
     * The URL of the Operation on the listener: its path template with each parameter URL-encoded, and the query.
     * A parameter can't be {@code .} or {@code ..}, so it can't move the request to another path.
     */
    static URI target(String listenerUrl, String pathTemplate, Map<String, String> pathParameters, Map<String, String> query) {
        Matcher matcher = PARAMETER.matcher(pathTemplate);
        StringBuilder path = new StringBuilder();
        while (matcher.find()) {
            String name = matcher.group(1);
            String value = pathParameters.get(name);
            if (value == null || value.isEmpty()) {
                throw new ApiRuleException("Fill in the path parameter " + name + ".");
            }
            if (value.equals(".") || value.equals("..")) {
                throw new ApiRuleException("The path parameter " + name + " can't be " + value + ".");
            }
            matcher.appendReplacement(path, Matcher.quoteReplacement(encode(value)));
        }
        matcher.appendTail(path);

        String queryString = query.entrySet().stream()
            .filter(entry -> !entry.getKey().isBlank() && entry.getValue() != null && !entry.getValue().isEmpty())
            .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
            .collect(Collectors.joining("&"));

        URI listener = URI.create(listenerUrl);
        String base = listener.getScheme() + "://" + listener.getRawAuthority();
        return URI.create(base + path + (queryString.isEmpty() ? "" : "?" + queryString));
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private static Map<String, String> orEmpty(Map<String, String> map) {
        return map == null ? Map.of() : map;
    }

    /**
     * The runtime's listener uses its own certificate, which the Gateway may not trust. This context is only used to
     * call that listener, at the address the Gateway is configured with.
     */
    private static SSLContext trustingContext() {
        try {
            SSLContext context = SSLContext.getInstance("TLS");
            context.init(null, new X509ExtendedTrustManager[] {new TrustingManager()}, null);
            return context;
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static final class TrustingManager extends X509ExtendedTrustManager {
        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType, Socket socket) {
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType, Socket socket) {
        }

        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType, SSLEngine engine) {
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType, SSLEngine engine) {
        }

        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType) {
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType) {
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[0];
        }
    }
}
