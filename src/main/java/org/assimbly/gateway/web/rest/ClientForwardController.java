package org.assimbly.gateway.web.rest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ClientForwardController {

    /**
     * Forwards any unmapped single-segment paths (except those containing a period) to the client {@code index.html}.
     * Multi-segment SPA routes are handled by {@link org.assimbly.gateway.web.filter.SpaWebFilter}.
     * @return forward to client {@code index.html}.
     */
    @GetMapping(value = "/{path:[^\\.]*}")
    public String forward() {
        return "forward:/";
    }
}
