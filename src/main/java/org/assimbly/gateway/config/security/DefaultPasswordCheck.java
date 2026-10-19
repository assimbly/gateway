package org.assimbly.gateway.config.security;

import jakarta.annotation.PostConstruct;
import org.assimbly.gateway.domain.User;
import org.assimbly.gateway.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tech.jhipster.config.JHipsterConstants;

import java.util.Set;

/**
 * A new Gateway comes with the accounts {@code admin} and {@code user}, whose password is their login. So the quick
 * start still works, they can sign in with it, but must choose a new password before doing anything else. This also
 * catches upgraded Gateways that still have them. Not on dev, where the default accounts are kept on purpose.
 */
@Lazy(false)
@Component
@Profile("!" + JHipsterConstants.SPRING_PROFILE_DEVELOPMENT)
public class DefaultPasswordCheck {

    static final Set<String> DEFAULT_ACCOUNTS = Set.of("admin", "user");

    private final Logger log = LoggerFactory.getLogger(DefaultPasswordCheck.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordChangeGate gate;
    private final TransactionTemplate transactionTemplate;

    public DefaultPasswordCheck(UserRepository userRepository, PasswordEncoder passwordEncoder, PasswordChangeGate gate,
                                PlatformTransactionManager transactionManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.gate = gate;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @PostConstruct
    void init() {
        transactionTemplate.executeWithoutResult(status -> check());
    }

    void check() {
        for (User user : userRepository.findAll()) {
            if (!user.isPasswordChangeRequired() && hasDefaultPassword(user)) {
                user.setPasswordChangeRequired(true);
                userRepository.save(user);
            }
            if (user.isPasswordChangeRequired()) {
                gate.require(user.getLogin());
                log.warn("The account '{}' still has its default password: it must choose a new one when it signs in", user.getLogin());
            }
        }
    }

    private boolean hasDefaultPassword(User user) {
        return DEFAULT_ACCOUNTS.contains(user.getLogin()) && user.getPassword() != null && passwordEncoder.matches(user.getLogin(), user.getPassword());
    }
}
