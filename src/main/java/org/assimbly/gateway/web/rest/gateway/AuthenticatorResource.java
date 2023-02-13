package org.assimbly.gateway.web.rest.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.CaseFormat;
import org.assimbly.gateway.authenticate.domain.TwoFactorRequest;
import org.assimbly.gateway.authenticate.domain.User;
import org.assimbly.gateway.authenticate.jwt.JwtValidator;
import org.assimbly.gateway.db.mongo.GoogleCredentialsRepository;
import org.assimbly.gateway.db.mongo.MongoDao;
import org.assimbly.gateway.authenticate.util.helper.ConfigHelper;
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

    private MongoDao mongoDao;
    private String database = ConfigHelper.get("baseDatabaseName");

    private final Logger log = LoggerFactory.getLogger(AuthenticatorResource.class);

    public AuthenticatorResource(){
        authenticator.setCredentialRepository(new GoogleCredentialsRepository(database));
        mongoDao = new MongoDao(database);
    }

    /**
     * GET  /authentication/register : registers two-factor authentication by email (using GoogleAuthenticator).
     * @return the ResponseEntity with the location of the QR code to register
     */
    @GetMapping("/authentication/register")
    public ResponseEntity<String> registerTwoFactorAuthentication(@RequestHeader String Authorization, @RequestHeader String domainName) {
        log.debug("REST request to register two-factor authentication");
        try {

            String userEmail = JwtValidator.decode(Authorization).get("name", String.class);
            User user = mongoDao.findUserByEmail(userEmail);

            String issuer = String.format("Dovetail - %s", CaseFormat.LOWER_CAMEL.to(CaseFormat.UPPER_CAMEL, domainName));
            GoogleAuthenticatorKey key = authenticator.createCredentials(user.getEmail());

            String qrLocation = GoogleAuthenticatorQRGenerator.getOtpAuthURL(issuer, user.getEmail(), key);

            return ResponseEntity
                .ok()
                .header("location", qrLocation)
                .build();
        } catch (Exception e) {
            log.error("Error to use GoogleAuth", e);
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("The session token is invalid.");
        }


    }

    /**
     * POST  /authentication/validate : validates the two-factor authentication code
     * @return boolean (true=valid)
     */
    @PostMapping(path = "/authentication/validate", consumes = {"application/json"})
    public boolean validateTwoFactorAuthentication(@RequestBody String body) {
        log.debug("REST request to validate two-factor authentication");
        try {
            TwoFactorRequest twoFactorRequest = null;
            if(body!=null){
                twoFactorRequest = new ObjectMapper().readValue(body, TwoFactorRequest.class);
            }
            return authenticator.authorizeUser(twoFactorRequest.getEmail(), twoFactorRequest.getToken());
        } catch (Exception e) {
            log.error("Error to validate token", e);
            return false;
        }
    }

    /**
     * POST  /authentication/remove : unregister for 2 factor authentication at Google validates the two-factor authentication code
     * @return boolean (true=valid)
     */
    @DeleteMapping(path = "/authentication/remove")
    public ResponseEntity<String> removeTwoFactorAuthentication(@RequestHeader String Authorization) {
        log.debug("REST request to delete two-factor authentication");
        try {
            String userEmail = JwtValidator.decode(Authorization).get("name", String.class);
            User user = mongoDao.findUserByEmail(userEmail);

            mongoDao.removeAuthenticatorSettings(user);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("The session token is invalid.");
        }
    }

}
