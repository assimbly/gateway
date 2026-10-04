package org.assimbly.gateway.service.api;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** The path rules of APIs and Operations: full paths, path parameters, conflicts and the runtime's path prefix. */
public final class ApiPaths {

    private static final Pattern PARAMETER = Pattern.compile("\\{([^}/]*)}");
    private static final Pattern PARAMETER_NAME = Pattern.compile("[A-Za-z0-9_.\\-]+");

    private ApiPaths() {
    }

    /** The base path and the path template joined, without double or trailing slashes (except a lone {@code /}). */
    public static String fullPath(String basePath, String path) {
        return normalize(nullToEmpty(basePath) + "/" + nullToEmpty(path));
    }

    public static String normalize(String path) {
        String normalized = ("/" + nullToEmpty(path)).replaceAll("/{2,}", "/");
        return normalized.length() > 1 && normalized.endsWith("/") ? normalized.substring(0, normalized.length() - 1) : normalized;
    }

    /** Method + full path with every parameter left unnamed, so {@code /c/{id}} and {@code /c/{key}} clash. */
    public static String conflictKey(String method, String fullPath) {
        return method.toUpperCase(Locale.ROOT) + " " + PARAMETER.matcher(normalize(fullPath)).replaceAll("{}");
    }

    public static List<String> pathParameterNames(String pathTemplate) {
        List<String> names = new ArrayList<>();
        Matcher matcher = PARAMETER.matcher(nullToEmpty(pathTemplate));
        while (matcher.find()) {
            names.add(matcher.group(1));
        }
        return names;
    }

    public static void checkBasePath(String basePath) {
        if (basePath == null || !basePath.startsWith("/")) {
            throw new ApiRuleException("The base path must start with /.");
        }
        if (basePath.contains("{") || basePath.contains("}")) {
            throw new ApiRuleException("The base path can't have parameters; put them in the Operation's path.");
        }
    }

    public static void checkPath(String path) {
        if (path == null || !path.startsWith("/")) {
            throw new ApiRuleException("The path must start with /.");
        }
        String withoutParameters = PARAMETER.matcher(path).replaceAll("");
        if (withoutParameters.contains("{") || withoutParameters.contains("}")) {
            throw new ApiRuleException("Each { in the path needs a closing }, around a parameter name such as {id}.");
        }
        List<String> names = pathParameterNames(path);
        for (String name : names) {
            if (!PARAMETER_NAME.matcher(name).matches()) {
                throw new ApiRuleException("Give each path parameter a name of letters, digits, _, - or ., such as {id}.");
            }
        }
        names.stream().filter(name -> names.indexOf(name) != names.lastIndexOf(name)).findFirst().ifPresent(name -> {
            throw new ApiRuleException("The path names the parameter {" + name + "} more than once.");
        });
    }

    /**
     * The path the runtime serves an Operation on. Its REST configuration has no context path, so a tenant's prefix
     * ({@code /_<tenant>}) goes into every path, as with the https Sources.
     */
    public static String runtimePath(String tenant, String fullPath) {
        if (tenant == null || tenant.isBlank()) {
            return normalize(fullPath);
        }
        String prefix = "/_" + tenant.strip().replaceFirst("^_+", "");
        return normalize(prefix + normalize(fullPath));
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
