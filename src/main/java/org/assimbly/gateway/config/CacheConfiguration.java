package org.assimbly.gateway.config;

import io.github.jhipster.config.JHipsterProperties;
import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.ehcache.expiry.Duration;
import org.ehcache.expiry.Expirations;
import org.ehcache.jsr107.Eh107Configuration;

import java.util.concurrent.TimeUnit;

import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.*;

@Configuration
@EnableCaching
@AutoConfigureAfter(value = { MetricsConfiguration.class })
@AutoConfigureBefore(value = { WebConfigurer.class, DatabaseConfiguration.class })
public class CacheConfiguration {

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache =
            jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(Object.class, Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                .withExpiry(Expirations.timeToLiveExpiration(Duration.of(ehcache.getTimeToLiveSeconds(), TimeUnit.SECONDS)))
                .build());
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            cm.createCache(org.assimbly.gateway.repository.UserRepository.USERS_BY_LOGIN_CACHE, jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.repository.UserRepository.USERS_BY_EMAIL_CACHE, jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.User.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Authority.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.User.class.getName() + ".authorities", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.PersistentToken.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.User.class.getName() + ".persistentTokens", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Gateway.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Gateway.class.getName() + ".flows", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Gateway.class.getName() + ".environmentVariables", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.EnvironmentVariables.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Flow.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Flow.class.getName() + ".endpointTos", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Service.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Service.class.getName()+ ".serviceKeys", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.ServiceKeys.class.getName(), jcacheConfiguration);            
            cm.createCache(org.assimbly.gateway.domain.Header.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Header.class.getName() + ".headerKeys", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.HeaderKeys.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Flow.class.getName() + ".toEndpoints", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.FromEndpoint.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.ToEndpoint.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.ErrorEndpoint.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Maintenance.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Maintenance.class.getName() + ".flows", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Flow.class.getName() + ".maintenances", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Group.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Group.class.getName() + ".gateways", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Group.class.getName() + ".users", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.WireTapEndpoint.class.getName(), jcacheConfiguration);
            // jhipster-needle-ehcache-add-entry
        };
    }
}
