package org.assimbly.gateway.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Locale;
import org.apache.commons.lang3.RandomStringUtils;
import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.User;
import org.assimbly.gateway.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;

/**
 * Test class for DomainUserDetailsService.
 *
 * @see DomainUserDetailsService
 */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
public class DomainUserDetailsServiceIntTest {

    private static final String USER_ONE_LOGIN = "test-user-one";
    private static final String USER_ONE_EMAIL = "test-user-one@localhost";
    private static final String USER_TWO_LOGIN = "test-user-two";
    private static final String USER_TWO_EMAIL = "test-user-two@localhost";
    private static final String USER_THREE_LOGIN = "test-user-three";
    private static final String USER_THREE_EMAIL = "test-user-three@localhost";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsService domainUserDetailsService;

    private User userOne;
    private User userTwo;
    private User userThree;

    @BeforeEach
    public void init() {
        userOne = new User();
        userOne.setLogin(USER_ONE_LOGIN);
        userOne.setPassword(RandomStringUtils.random(60));
        userOne.setActivated(true);
        userOne.setEmail(USER_ONE_EMAIL);
        userOne.setFirstName("userOne");
        userOne.setLastName("doe");
        userRepository.save(userOne);

        userTwo = new User();
        userTwo.setLogin(USER_TWO_LOGIN);
        userTwo.setPassword(RandomStringUtils.random(60));
        userTwo.setActivated(true);
        userTwo.setEmail(USER_TWO_EMAIL);
        userTwo.setFirstName("userTwo");
        userTwo.setLastName("doe");
        userRepository.save(userTwo);

        userThree = new User();
        userThree.setLogin(USER_THREE_LOGIN);
        userThree.setPassword(RandomStringUtils.random(60));
        userThree.setActivated(false);
        userThree.setEmail(USER_THREE_EMAIL);
        userThree.setFirstName("userThree");
        userThree.setLastName("doe");
        userRepository.save(userThree);
    }

    @Test
    @Transactional
    public void assertThatUserCanBeFoundByLogin() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_LOGIN);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test
    @Transactional
    public void assertThatUserCanBeFoundByLoginIgnoreCase() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_LOGIN.toUpperCase(Locale.ENGLISH));
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test
    @Transactional
    public void assertThatUserCanBeFoundByEmail() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_TWO_EMAIL);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_TWO_LOGIN);
    }

    @Test
    @Transactional
    public void assertThatUserCanNotBeFoundByEmailIgnoreCase() {
        assertThrows(UsernameNotFoundException.class, () ->
            domainUserDetailsService.loadUserByUsername(USER_TWO_EMAIL.toUpperCase(Locale.ENGLISH))
        );
    }

    @Test
    @Transactional
    public void assertThatEmailIsPrioritizedOverLogin() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_EMAIL);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test
    @Transactional
    public void assertThatUserNotActivatedExceptionIsThrownForNotActivatedUsers() {
        assertThrows(UserNotActivatedException.class, () -> domainUserDetailsService.loadUserByUsername(USER_THREE_LOGIN));
    }
}
