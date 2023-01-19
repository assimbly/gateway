package org.assimbly.gateway.web.rest.gateway;

import com.google.common.base.CaseFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;

/**
 * REST controller for managing authentication (two factor-authentication).
 */
@RestController
@RequestMapping("/api")
public class AuthenticatorResource {

    private static final GoogleAuthenticator authenticator = new GoogleAuthenticator();

    private final Logger log = LoggerFactory.getLogger(AuthenticatorResource.class);

    /**
     * GET  /authentication/register : registers two-factor authentication by email (using GoogleAuthenticator).
     * @return the ResponseEntity with the location of the QR code to register
     */
    @GetMapping("/authentication/register")
    public ResponseEntity<String> registerTwoFactorAuthentication(@RequestHeader String email, @RequestHeader String domainName) {
        log.debug("REST request to register two-factor authentication");
        try {

            String issuer = String.format("Dovetail - %s", CaseFormat.LOWER_CAMEL.to(CaseFormat.UPPER_CAMEL, domainName));

            GoogleAuthenticatorKey key = authenticator.createCredentials(email);

            String qrLocation = GoogleAuthenticatorQRGenerator.getOtpAuthURL(issuer, email, key);

            return ResponseEntity
                .ok()
                .body(qrLocation);
        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("The session token is invalid.");
        }


    }

    /**
     * GET  /authentication/validate : validates the two-factor authentication code
     * @return boolean (true=valid)
     */
    @GetMapping(path = "/authentication/validate")
    public boolean validateTwoFactorAuthentication(@RequestHeader String email, @RequestHeader Integer token) {
        log.debug("REST request to validate two-factor authentication");
        return authenticator.authorizeUser(email, token);
    }

}
