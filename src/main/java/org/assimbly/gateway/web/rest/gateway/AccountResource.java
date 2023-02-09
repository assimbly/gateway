package org.assimbly.gateway.web.rest.gateway;

import io.undertow.util.BadRequestException;
import org.assimbly.gateway.authenticate.domain.Status;
import org.assimbly.gateway.authenticate.domain.Tenant;
import org.assimbly.gateway.authenticate.exception.InvalidTenantException;
import org.assimbly.gateway.authenticate.exception.InvalidUserException;
import org.assimbly.gateway.authenticate.jwt.JwtBuilder;
import org.assimbly.gateway.authenticate.mongo.MongoDao;
import org.assimbly.gateway.authenticate.util.helper.ConfigHelper;
import org.assimbly.gateway.domain.User;
import org.assimbly.gateway.repository.UserRepository;
import org.assimbly.gateway.security.SecurityUtils;
import org.assimbly.gateway.service.MailService;
import org.assimbly.gateway.service.UserService;
import org.assimbly.gateway.service.dto.AdminUserDTO;
import org.assimbly.gateway.service.dto.PasswordChangeDTO;
import org.assimbly.gateway.web.rest.errors.*;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.vm.KeyAndPasswordVM;
import org.assimbly.gateway.web.rest.vm.ManagedUserVM;

import java.io.UnsupportedEncodingException;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import org.apache.commons.lang3.StringUtils;
import org.assimbly.util.helper.Base64Helper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static java.nio.charset.StandardCharsets.UTF_8;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {

        private AccountResourceException(String message) {
            super(message);
        }
    }

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    private final UserRepository userRepository;

    private final UserService userService;

    private final MailService mailService;

    private MongoDao mongoDao;
    private String database = ConfigHelper.get("baseDatabaseName");

    public AccountResource(UserRepository userRepository, UserService userService, MailService mailService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
        this.mongoDao = new MongoDao(database);
    }

    /**
     * {@code POST  /register} : register the user.
     *
     * @param managedUserVM the managed user View Model.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already used.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {
        if (isPasswordLengthInvalid(managedUserVM.getPassword())) {
            throw new InvalidPasswordException();
        }
        User user = userService.registerUser(managedUserVM, managedUserVM.getPassword());
        mailService.sendActivationEmail(user);
    }

    /**
     * {@code GET  /activate} : activate the registered user.
     *
     * @param key the activation key.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be activated.
     */
    @GetMapping("/activate")
    public void activateAccount(@RequestParam(value = "key") String key) {
        Optional<User> user = userService.activateRegistration(key);
        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this activation key");
        }
    }

    /**
     * {@code GET  /authenticate} : check if the user is authenticated, and return its token.
     *
     * @param request the HTTP request.
     * @return the token if the user is authenticated.
     */
    @GetMapping("/authenticate")
    public ResponseEntity<String> isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        try {
            String[] values = decodeHeader(request.getHeader("Authorization"));
            org.assimbly.gateway.authenticate.domain.User user = authenticate(values[0], values[1]);
            String token = buildToken(user);
            return ResponseEntity.ok().body(token);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid authentication");
        }
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be returned.
     */
    @GetMapping("/account")
    public AdminUserDTO getAccount() throws SuppressableStacktraceException {
        return userService
            .getUserWithAuthorities()
            .map(AdminUserDTO::new)
            .orElseThrow(() -> new SuppressableStacktraceException("User could not be found. Login to revalidate", true));
    }

    /**
     * {@code POST  /account} : update the current user information.
     *
     * @param userDTO the current user information.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user login wasn't found.
     */
    @PostMapping("/account")
    public void saveAccount(@Valid @RequestBody AdminUserDTO userDTO) {
        String userLogin = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new AccountResourceException("Current user login not found"));
        Optional<User> existingUser = userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
        if (existingUser.isPresent() && (!existingUser.get().getLogin().equalsIgnoreCase(userLogin))) {
            throw new EmailAlreadyUsedException();
        }
        Optional<User> user = userRepository.findOneByLogin(userLogin);
        if (!user.isPresent()) {
            throw new AccountResourceException("User could not be found");
        }
        userService.updateUser(
            userDTO.getFirstName(),
            userDTO.getLastName(),
            userDTO.getEmail(),
            userDTO.getLangKey(),
            userDTO.getImageUrl()
        );
    }

    /**
     * {@code POST  /account/change-password} : changes the current user's password.
     *
     * @param passwordChangeDto current and new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the new password is incorrect.
     */
    @PostMapping(path = "/account/change-password")
    public void changePassword(@RequestBody PasswordChangeDTO passwordChangeDto) {
        if (isPasswordLengthInvalid(passwordChangeDto.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        userService.changePassword(passwordChangeDto.getCurrentPassword(), passwordChangeDto.getNewPassword());
    }

    /**
     * {@code POST   /account/reset-password/init} : Send an email to reset the password of the user.
     *
     * @param mail the mail of the user.
     */
    @PostMapping(path = "/account/reset-password/init")
    public void requestPasswordReset(@RequestBody String mail) {
        Optional<User> user = userService.requestPasswordReset(mail);
        if (user.isPresent()) {
            mailService.sendPasswordResetMail(user.get());
        } else {
            // Pretend the request has been successful to prevent checking which emails really exist
            // but log that an invalid attempt has been made
            log.warn("Password reset requested for non existing mail");
        }
    }

    /**
     * {@code POST   /account/reset-password/finish} : Finish to reset the password of the user.
     *
     * @param keyAndPassword the generated key and the new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the password could not be reset.
     */
    @PostMapping(path = "/account/reset-password/finish")
    public void finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
        if (isPasswordLengthInvalid(keyAndPassword.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        Optional<User> user = userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey());

        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this reset key");
        }
    }

    private static boolean isPasswordLengthInvalid(String password) {
        return (
            StringUtils.isEmpty(password) ||
            password.length() < ManagedUserVM.PASSWORD_MIN_LENGTH ||
            password.length() > ManagedUserVM.PASSWORD_MAX_LENGTH
        );
    }

    /**
     * Decode the base64 header containing the clients credentials and
     * return this as an array containing the email, password and tenant name.
     *
     * @param base64 string to decode.
     * @return string array with credentials.
     * @throws BadRequestException when something is wrong with the base64 encoding
     *                             or necessary data is missing.
     */
    private String[] decodeHeader(String base64) throws BadRequestException {
        String[] values;

        try {
            String header = Base64Helper.unmarshal(base64, UTF_8);
            values = header.split(":");
        } catch (Exception e) {
            throw new BadRequestException(e);
        }

        if (values.length != 2
            || nullOrEmpty(values[0])
            || nullOrEmpty(values[1])) {

            throw new BadRequestException();
        }

        return values;
    }

    /**
     * Authenticate a possible client by the given email and password.
     * Return the user if one is found with the given credentials, else throw an exception.
     *
     * @param email    to find the client by.
     * @param password to validate the client by.
     * @return a User object with the authenticated client.
     * @throws NotAuthorizedException when the user with the credentials is not found.
     */

    private org.assimbly.gateway.authenticate.domain.User authenticate(String email, String password) throws InvalidUserException, InvalidTenantException {
        org.assimbly.gateway.authenticate.domain.User user = mongoDao.findUser(email, password);
        if (user == null || !Status.ACTIVE.equals(user.getStatus())) {
            throw new InvalidUserException();
        }

        Tenant tenant = mongoDao.findTenant(user);
        if (tenant != null && tenant.getDisabled()) {
            throw new InvalidTenantException();
        }

        return user;
    }

    /**
     * Create a JWT belonging to the given User.
     *
     * @param user to create the token for.
     * @return a valid Signed JWT.
     * @throws UnsupportedEncodingException when the encoding used to sign the token is not supported.
     */
    private String buildToken(org.assimbly.gateway.authenticate.domain.User user) throws UnsupportedEncodingException {
        return JwtBuilder.build(user.getEmail(), "role");
    }

    /**
     * Check if a String is null or empty.
     *
     * @param value the String to check
     * @return true if the given String is null or empty.
     */
    private static boolean nullOrEmpty(String value) {
        return value == null || value.isEmpty();
    }

    public class SuppressableStacktraceException extends Exception {

        private boolean suppressStacktrace = false;

        public SuppressableStacktraceException(String message, boolean suppressStacktrace) {
            super(message, null, suppressStacktrace, !suppressStacktrace);
            this.suppressStacktrace = suppressStacktrace;
        }

        @Override
        public String toString() {
            if (suppressStacktrace) {
                return getLocalizedMessage();
            } else {
                return super.toString();
            }
        }
    }

}
