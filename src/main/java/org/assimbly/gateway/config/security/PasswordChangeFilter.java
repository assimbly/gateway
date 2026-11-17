package org.assimbly.gateway.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.assimbly.gateway.security.SecurityUtils;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Answers {@code 403 password-change-required} to a user who still has a default password, for everything except
 * what they need to choose a new one: reading their account and changing their password.
 */
public class PasswordChangeFilter extends OncePerRequestFilter {

    public static final String PROBLEM_TYPE = "https://www.jhipster.tech/problem/password-change-required";

    private final PasswordChangeGate gate;

    public PasswordChangeFilter(PasswordChangeGate gate) {
        this.gate = gate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        if (!gate.isEmpty() && isGuarded(request) && !isAllowed(request) && SecurityUtils.getCurrentUserLogin().filter(gate::isRequired).isPresent()) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.getWriter().write(
                "{\"type\":\"" + PROBLEM_TYPE + "\",\"title\":\"Password change required\",\"status\":403," +
                "\"detail\":\"Choose a new password before using the Gateway.\",\"message\":\"error.passwordChangeRequired\"}"
            );
            return;
        }
        chain.doFilter(request, response);
    }

    private static boolean isGuarded(HttpServletRequest request) {
        String path = path(request);
        return path.startsWith("/api/") || path.startsWith("/management/");
    }

    private static boolean isAllowed(HttpServletRequest request) {
        String path = path(request);
        String method = request.getMethod();
        return (HttpMethod.GET.matches(method) && path.equals("/api/account")) ||
            (HttpMethod.POST.matches(method) && path.equals("/api/account/change-password")) ||
            path.equals("/api/authenticate") ||
            // public anyway
            path.equals("/management/info") || path.equals("/management/health") || path.startsWith("/management/health/");
    }

    private static String path(HttpServletRequest request) {
        return request.getRequestURI().substring(request.getContextPath().length());
    }
}
