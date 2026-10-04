package org.assimbly.gateway.service.api;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * What a Response Sink answers, as kept in its Step: the status, the body's language and the headers in its options
 * ({@code status=201&language=simple&header.X-Trace=abc}, header values URL-encoded), and the body in its uri.
 * An empty body keeps the current one.
 */
public record ResponseSettings(String status, String body, String language, Map<String, String> headers) {

    public static final String DEFAULT_STATUS = "200";
    private static final String HEADER_PREFIX = "header.";

    public static ResponseSettings of(String uri, String options) {
        String status = DEFAULT_STATUS;
        String language = null;
        Map<String, String> headers = new LinkedHashMap<>();
        if (options != null && !options.isBlank()) {
            for (String option : options.split("&")) {
                String[] pair = option.split("=", 2);
                String value = pair.length > 1 ? pair[1] : "";
                if (pair[0].equals("status") && !value.isBlank()) {
                    status = value.strip();
                } else if (pair[0].equals("language") && !value.isBlank()) {
                    language = value.strip();
                } else if (pair[0].startsWith(HEADER_PREFIX) && pair[0].length() > HEADER_PREFIX.length()) {
                    headers.put(pair[0].substring(HEADER_PREFIX.length()), URLDecoder.decode(value, StandardCharsets.UTF_8));
                }
            }
        }
        String body = uri == null || uri.isEmpty() ? null : uri;
        return new ResponseSettings(status, body, body == null ? null : language == null ? "constant" : language, headers);
    }

    public boolean keepsBody() {
        return body == null;
    }

    /** The status, language and headers as the Step's options keep them; the body stays in its uri. */
    public String toOptions() {
        StringBuilder options = new StringBuilder("status=").append(status);
        if (body != null && language != null) {
            options.append("&language=").append(language);
        }
        headers.forEach((name, value) -> options.append('&').append(HEADER_PREFIX).append(name).append('=')
            .append(URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20")));
        return options.toString();
    }

    /**
     * Every header the caller gets: the status, the Operation's response media type as {@code Content-Type} unless a
     * header of the Step sets it, and the Step's own headers.
     */
    public Map<String, String> answerHeaders(String responseMediaType) {
        Map<String, String> answer = new LinkedHashMap<>();
        answer.put("CamelHttpResponseCode", status);
        boolean contentTypeGiven = headers.keySet().stream().anyMatch("Content-Type"::equalsIgnoreCase);
        if (!contentTypeGiven && responseMediaType != null && !responseMediaType.isBlank()) {
            answer.put("Content-Type", responseMediaType);
        }
        answer.putAll(headers);
        return answer;
    }
}
