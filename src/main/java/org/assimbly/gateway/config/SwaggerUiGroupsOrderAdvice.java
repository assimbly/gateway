package org.assimbly.gateway.config;

import org.assimbly.gateway.config.OpenApiGroupsConfiguration.ApiGroup;
import org.springdoc.core.properties.AbstractSwaggerUiConfigProperties.SwaggerUrl;
import org.springdoc.webmvc.ui.SwaggerConfigResource;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Springdoc always sorts the groups of the Swagger UI dropdown by display name. This puts the groups of
 * {@link ApiGroup} first, in the order of the enum, followed by the other groups (All endpoints, management).
 */
@ControllerAdvice(assignableTypes = SwaggerConfigResource.class)
public class SwaggerUiGroupsOrderAdvice implements ResponseBodyAdvice<Object> {

    private static final String URLS = "urls";

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        if (!(body instanceof Map<?, ?> config) || !(config.get(URLS) instanceof Collection<?> urls)) {
            return body;
        }
        List<?> sorted = urls.stream()
            .sorted(Comparator.comparingInt(SwaggerUiGroupsOrderAdvice::position))
            .toList();
        Map<Object, Object> result = new LinkedHashMap<>(config);
        result.put(URLS, sorted);
        return result;
    }

    private static int position(Object url) {
        if (url instanceof SwaggerUrl swaggerUrl && swaggerUrl.getUrl() != null) {
            String group = swaggerUrl.getUrl().substring(swaggerUrl.getUrl().lastIndexOf('/') + 1);
            for (ApiGroup apiGroup : ApiGroup.values()) {
                if (apiGroup.id.equals(group)) return apiGroup.ordinal();
            }
        }
        return ApiGroup.values().length;
    }
}
