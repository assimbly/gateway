package org.assimbly.gateway.web.rest.gateway;

import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.DefaultProfileUtil;

import io.github.jhipster.config.JHipsterProperties;

import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Resource to return information about the currently running Spring profiles.
 */
@RestController
@RequestMapping("/api")
public class ProfileInfoResource {

    private final Environment env;

    private final JHipsterProperties jHipsterProperties;

    private final ApplicationProperties.Documentation documentation;

    public ProfileInfoResource(Environment env, JHipsterProperties jHipsterProperties, ApplicationProperties applicationProperties) {
        this.env = env;
        this.jHipsterProperties = jHipsterProperties;
        this.documentation = applicationProperties.getDocumentation();
    }

    @GetMapping("/profile-info")
    public ProfileInfoVM getActiveProfiles() {
        String[] activeProfiles = DefaultProfileUtil.getActiveProfiles(env);
        return new ProfileInfoVM(activeProfiles);
    }

    @GetMapping("/documentation/url")
    public String getUrl() {
        String propertyUrl = documentation.getCamelUrl();
        return propertyUrl;
    }

    class ProfileInfoVM {

        private String[] activeProfiles;

        ProfileInfoVM(String[] activeProfiles) {
            this.activeProfiles = activeProfiles;
        }

        public String[] getActiveProfiles() {
            return activeProfiles;
        }

    }
}
