package org.assimbly.gateway.web.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

public class SpaWebFilter extends OncePerRequestFilter {

    // Pre-compiled exclusion prefixes for faster lookup
    private static final Set<String> EXCLUDED_PREFIXES = Set.of(
        "/api",
        "/health",
        "/management",
        "/v3/api-docs",
        "/h2-console"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String requestURI = request.getRequestURI();

        // Skip filter entirely for excluded paths - no filterChain.doFilter() overhead
        if (isExcludedPath(requestURI)) {
            return true;
        }

        // Skip for static resources
        String path = getPathWithoutContext(request, requestURI);
        return path.indexOf('.') != -1;
    }

    // Cache for context path to avoid repeated calculation
    private volatile String contextPath;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        // If we reach here, it's a SPA route - forward directly
        request.getRequestDispatcher("/index.html").forward(request, response);
        // Note: No filterChain.doFilter() call needed here since we're forwarding
    }

    private boolean isExcludedPath(String requestURI) {
        // Check exclusions without substring operations first
        for (String prefix : EXCLUDED_PREFIXES) {
            if (requestURI.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    private String getPathWithoutContext(HttpServletRequest request, String requestURI) {
        // Cache context path to avoid repeated calls
        if (contextPath == null) {
            contextPath = request.getContextPath();
        }

        // Only subtract context path if it exists and is not empty
        if (contextPath.isEmpty()) {
            return requestURI;
        }

        return requestURI.substring(contextPath.length());
    }
}
