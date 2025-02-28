package org.assimbly.gateway.web.rest.gateway;

import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.DefaultProfileUtil;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@RestController
@RequestMapping("/api")
public class ProfileInfoResource {

    private final Environment env;

    private final ApplicationProperties.Documentation documentation;

    public ProfileInfoResource(Environment env, ApplicationProperties applicationProperties) {
        this.env = env;
        this.documentation = applicationProperties.getDocumentation();
    }

    @GetMapping("/profile-info")
    public ProfileInfoVM getActiveProfiles() {
        String[] activeProfiles = DefaultProfileUtil.getActiveProfiles(env);
        return new ProfileInfoVM(activeProfiles);
    }

    @GetMapping("/documentation/url")
    public String getUrl() {
        return documentation.getCamelUrl();
    }

    class ProfileInfoVM {

        private final String[] activeProfiles;

        ProfileInfoVM(String[] activeProfiles) {
            this.activeProfiles = activeProfiles;
        }

        public String[] getActiveProfiles() {
            return activeProfiles;
        }
    }
}
