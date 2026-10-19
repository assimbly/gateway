package org.assimbly.gateway.config.security;

import org.assimbly.gateway.config.ApplicationProperties;
import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;
import tech.jhipster.config.JHipsterConstants;

/** Tells the sign-in page, through /management/info, whether it may offer to create an account. */
@Component
public class RegistrationInfoContributor implements InfoContributor {

    private final boolean registration;

    public RegistrationInfoContributor(ApplicationProperties applicationProperties, Environment env) {
        this.registration = applicationProperties.getSecurity().isRegistration() ||
            env.acceptsProfiles(Profiles.of(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT));
    }

    @Override
    public void contribute(Info.Builder builder) {
        builder.withDetail("registration", registration);
    }
}
