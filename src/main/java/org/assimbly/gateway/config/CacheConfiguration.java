package org.assimbly.gateway.config;

import java.time.Duration;
import org.ehcache.config.builders.*;
import org.ehcache.jsr107.Eh107Configuration;
import org.hibernate.cache.jcache.ConfigSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.*;
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.config.cache.PrefixedKeyGenerator;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private GitProperties gitProperties;
    private BuildProperties buildProperties;
    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache = jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration =
            Eh107Configuration.fromEhcacheCacheConfiguration(
                CacheConfigurationBuilder
                    .newCacheConfigurationBuilder(Object.class, Object.class, ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                    .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofSeconds(ehcache.getTimeToLiveSeconds())))
                    .build()
            );
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cacheManager) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cacheManager);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            createCache(cm, org.assimbly.gateway.repository.UserRepository.USERS_BY_LOGIN_CACHE);
            createCache(cm, org.assimbly.gateway.repository.UserRepository.USERS_BY_EMAIL_CACHE);
            createCache(cm, org.assimbly.gateway.domain.User.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Authority.class.getName());
            createCache(cm, org.assimbly.gateway.domain.User.class.getName() + ".authorities");
            createCache(cm, org.assimbly.gateway.domain.PersistentToken.class.getName());
            createCache(cm, org.assimbly.gateway.domain.User.class.getName() + ".persistentTokens");
            createCache(cm, org.assimbly.gateway.domain.Gateway.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Gateway.class.getName() + ".flows");
            createCache(cm, org.assimbly.gateway.domain.Gateway.class.getName() + ".environmentVariables");
            createCache(cm, org.assimbly.gateway.domain.EnvironmentVariables.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Flow.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Service.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Service.class.getName() + ".serviceKeys");
            createCache(cm, org.assimbly.gateway.domain.ServiceKeys.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Header.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Header.class.getName() + ".headerKeys");
            createCache(cm, org.assimbly.gateway.domain.HeaderKeys.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Flow.class.getName() + ".endpoints");
            createCache(cm, org.assimbly.gateway.domain.Endpoint.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Maintenance.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Maintenance.class.getName() + ".flows");
            createCache(cm, org.assimbly.gateway.domain.Flow.class.getName() + ".maintenances");
            createCache(cm, org.assimbly.gateway.domain.Security.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Group.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Group.class.getName() + ".gateways");
            createCache(cm, org.assimbly.gateway.domain.Group.class.getName() + ".users");
            createCache(cm, org.assimbly.gateway.domain.Broker.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Route.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Queue.class.getName());
            createCache(cm, org.assimbly.gateway.domain.Topic.class.getName());
            // jhipster-needle-ehcache-add-entry
        };
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        } else {
            cm.createCache(cacheName, jcacheConfiguration);
        }
    }

    @Autowired(required = false)
    public void setGitProperties(GitProperties gitProperties) {
        this.gitProperties = gitProperties;
    }

    @Autowired(required = false)
    public void setBuildProperties(BuildProperties buildProperties) {
        this.buildProperties = buildProperties;
    }

    @Bean
    public KeyGenerator keyGenerator() {
        return new PrefixedKeyGenerator(this.gitProperties, this.buildProperties);
    }
}
