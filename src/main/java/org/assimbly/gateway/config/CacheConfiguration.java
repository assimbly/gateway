package org.assimbly.gateway.config;

import java.time.Duration;

import org.ehcache.config.builders.*;
import org.ehcache.jsr107.Eh107Configuration;

import org.hibernate.cache.jcache.ConfigSettings;
import io.github.jhipster.config.JHipsterProperties;

import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.*;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache = jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(Object.class, Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofSeconds(ehcache.getTimeToLiveSeconds())))
                .build());
    }
    
    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cacheManager) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cacheManager);
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
            cm.createCache(org.assimbly.gateway.domain.Service.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Service.class.getName()+ ".serviceKeys", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.ServiceKeys.class.getName(), jcacheConfiguration);            
            cm.createCache(org.assimbly.gateway.domain.Header.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Header.class.getName() + ".headerKeys", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.HeaderKeys.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Flow.class.getName() + ".endpoints", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Endpoint.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Maintenance.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Maintenance.class.getName() + ".flows", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Flow.class.getName() + ".maintenances", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Security.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Group.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Group.class.getName() + ".gateways", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Group.class.getName() + ".users", jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.WireTapEndpoint.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Broker.class.getName(), jcacheConfiguration);
            cm.createCache(org.assimbly.gateway.domain.Route.class.getName(), jcacheConfiguration);
            // jhipster-needle-ehcache-add-entry
        };
    }
}
