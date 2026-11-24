package org.assimbly.gateway.config.firststart;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.assimbly.gateway.config.Constants;
import org.assimbly.gateway.config.security.PasswordChangeGate;
import org.assimbly.gateway.domain.Authority;
import org.assimbly.gateway.domain.User;
import org.assimbly.gateway.repository.AuthorityRepository;
import org.assimbly.gateway.repository.UserRepository;
import org.assimbly.gateway.security.AuthoritiesConstants;
import org.assimbly.gateway.service.BrokerService;
import org.assimbly.gateway.service.dto.BrokerDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Settings a server passes in environment variables (from its deployment tooling, for example), which win over what the database
 * holds. They are applied on every start, after a new Gateway is set up and before the brokers autostart and the
 * default passwords are checked. A variable that isn't set leaves the database as it is; removing one later doesn't
 * undo what it set.
 * <ul>
 *   <li>{@code ASSIMBLY_API_USERNAME} and {@code ASSIMBLY_API_PASSWORD}: the user other services log in with at
 *   {@code /api/authenticate}. Created when missing, as a user, not an administrator.</li>
 *   <li>{@code ASSIMBLY_ADMIN_PASSWORD}: the password of {@code admin}.</li>
 *   <li>{@code ASSIMBLY_BROKER_TYPE} ({@code activemq} or {@code artemis}) and {@code ASSIMBLY_BROKER_CONFIGURATION}
 *   (such as {@code file}): the broker. Without a broker, one is created that starts with the Gateway.</li>
 * </ul>
 * A password set this way is the server's choice, so it doesn't have to be changed at sign-in.
 */
@Lazy(false)
@Component("environmentOverrides")
@DependsOn("firstStart")
public class EnvironmentOverrides {

    static final String API_USERNAME = "ASSIMBLY_API_USERNAME";
    static final String API_PASSWORD = "ASSIMBLY_API_PASSWORD";
    static final String ADMIN_PASSWORD = "ASSIMBLY_ADMIN_PASSWORD";
    static final String BROKER_TYPE = "ASSIMBLY_BROKER_TYPE";
    static final String BROKER_CONFIGURATION = "ASSIMBLY_BROKER_CONFIGURATION";

    static final String ADMIN = "admin";

    private final Logger log = LoggerFactory.getLogger(EnvironmentOverrides.class);

    private final Environment env;
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordChangeGate gate;
    private final BrokerService brokerService;
    private final CacheManager cacheManager;
    private final TransactionTemplate transactionTemplate;

    public EnvironmentOverrides(
        Environment env,
        UserRepository userRepository,
        AuthorityRepository authorityRepository,
        PasswordEncoder passwordEncoder,
        PasswordChangeGate gate,
        BrokerService brokerService,
        CacheManager cacheManager,
        PlatformTransactionManager transactionManager
    ) {
        this.env = env;
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.passwordEncoder = passwordEncoder;
        this.gate = gate;
        this.brokerService = brokerService;
        this.cacheManager = cacheManager;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @PostConstruct
    void init() {
        // Not caught: a server that sets these counts on them, so a Gateway that can't apply them doesn't start
        transactionTemplate.executeWithoutResult(status -> apply());
    }

    void apply() {
        String apiUsername = value(API_USERNAME);
        String apiPassword = password(API_PASSWORD);
        if (apiUsername != null && apiPassword != null) {
            setPassword(apiUsername, apiPassword, API_PASSWORD, AuthoritiesConstants.USER);
        } else if (apiUsername != null || apiPassword != null) {
            log.warn("Only one of {} and {} is set: the API user is left as it is", API_USERNAME, API_PASSWORD);
        }

        String adminPassword = password(ADMIN_PASSWORD);
        if (adminPassword != null) {
            setPassword(ADMIN, adminPassword, ADMIN_PASSWORD, AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER);
        }

        String brokerType = value(BROKER_TYPE);
        String brokerConfiguration = value(BROKER_CONFIGURATION);
        if (brokerType != null || brokerConfiguration != null) {
            applyBroker(lowerCase(brokerType), lowerCase(brokerConfiguration));
        }
    }

    /** Gives the user this password, creating them with these authorities when they don't exist yet. */
    private void setPassword(String login, String password, String variable, String... newUserAuthorities) {
        String normalized = login.toLowerCase(Locale.ENGLISH);
        if (!normalized.matches(Constants.LOGIN_REGEX) || normalized.length() > 50) {
            throw new IllegalStateException("'" + login + "' can't be a login: use letters, digits and _.@-, at most 50");
        }

        // Not the cached lookup: a sign-in reads the user from that cache, which must not keep the old password
        Optional<User> existing = userRepository.findOneByLogin(normalized);
        User user = existing.orElseGet(() -> newUser(normalized, newUserAuthorities));
        boolean changed = existing.isEmpty();
        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(password));
            changed = true;
        }
        if (!user.isActivated()) {
            user.setActivated(true);
            changed = true;
        }
        if (user.isPasswordChangeRequired()) {
            user.setPasswordChangeRequired(false);
            changed = true;
        }
        gate.clear(normalized);

        if (changed) {
            userRepository.save(user);
            evict(UserRepository.USERS_BY_LOGIN_CACHE, user.getLogin());
            evict(UserRepository.USERS_BY_EMAIL_CACHE, user.getEmail());
            log.info(
                existing.isEmpty() ? "Created the user '{}' with the password from {}" : "Set the password of '{}' from {}",
                normalized,
                variable
            );
        }
    }

    private void evict(String cacheName, String key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null && key != null) {
            cache.evict(key);
        }
    }

    private User newUser(String login, String... authorities) {
        User user = new User();
        user.setLogin(login);
        user.setActivated(true);
        Set<Authority> found = Arrays.stream(authorities)
            .map(authorityRepository::findById)
            .flatMap(Optional::stream)
            .collect(Collectors.toSet());
        user.setAuthorities(found);
        return user;
    }

    /** Sets the type and configuration of the (first) broker, or creates a broker that starts with the Gateway. */
    private void applyBroker(String type, String configuration) {
        List<BrokerDTO> brokers = brokerService.findAll();
        if (brokers.isEmpty()) {
            BrokerDTO broker = FirstStart.defaultBroker();
            if (type != null) {
                broker.setType(type);
            }
            if (configuration != null) {
                broker.setConfigurationType(configuration);
            }
            brokerService.save(broker);
            log.info(
                "Created the broker '{}' ({}, {} configuration), which starts with the Gateway",
                broker.getName(),
                broker.getType(),
                broker.getConfigurationType()
            );
            return;
        }

        BrokerDTO broker = brokers.stream().min(Comparator.comparing(BrokerDTO::getId)).orElseThrow();
        if (brokers.size() > 1) {
            log.warn(
                "There are {} brokers: {} and {} apply to the first one, '{}'",
                brokers.size(),
                BROKER_TYPE,
                BROKER_CONFIGURATION,
                broker.getName()
            );
        }
        boolean changed = false;
        if (type != null && !type.equals(broker.getType())) {
            log.info("Broker '{}': type {} instead of {}, from {}", broker.getName(), type, broker.getType(), BROKER_TYPE);
            broker.setType(type);
            changed = true;
        }
        if (configuration != null && !configuration.equals(broker.getConfigurationType())) {
            log.info(
                "Broker '{}': {} configuration instead of {}, from {}",
                broker.getName(),
                configuration,
                broker.getConfigurationType(),
                BROKER_CONFIGURATION
            );
            broker.setConfigurationType(configuration);
            changed = true;
        }
        if (changed) {
            brokerService.save(broker);
        }
    }

    /** A setting, trimmed; unset when blank. */
    private String value(String name) {
        String value = env.getProperty(name);
        return value == null || value.isBlank() ? null : value.trim();
    }

    /** A password as it is (spaces count); unset when blank. */
    private String password(String name) {
        String value = env.getProperty(name);
        return value == null || value.isBlank() ? null : value;
    }

    private static String lowerCase(String value) {
        return value == null ? null : value.toLowerCase(Locale.ROOT);
    }
}
