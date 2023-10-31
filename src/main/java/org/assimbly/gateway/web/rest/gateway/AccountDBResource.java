package org.assimbly.gateway.web.rest.gateway;

import org.assimbly.gateway.authenticate.domain.Status;
import org.assimbly.gateway.authenticate.domain.Tenant;
import org.assimbly.gateway.authenticate.exception.InvalidTenantException;
import org.assimbly.gateway.authenticate.exception.InvalidUserException;
import org.assimbly.gateway.db.mongo.MongoDao;
import org.assimbly.gateway.authenticate.util.helper.ConfigHelper;
import org.assimbly.gateway.authenticate.domain.User;
import org.assimbly.gateway.web.rest.util.TokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api/db")
public class AccountDBResource {

    private final Logger log = LoggerFactory.getLogger(AccountDBResource.class);

    public enum DataBase {MONGO}

    private MongoDao mongoDao;
    private String database = ConfigHelper.get("baseDatabaseName");

    public AccountDBResource() {
        this.mongoDao = new MongoDao(database);
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
            String dbStr = request.getHeader("db");
            DataBase dbType = (dbStr!=null ? DataBase.valueOf(dbStr.toUpperCase()) : null);
            String[] values = TokenUtil.decodeHeader(request.getHeader("Authorization"));
            User user = null;

            switch (dbType) {
                case MONGO:
                    user = authenticateOnMongo(values[0], values[1]);
            }

            String token = (user!=null ? TokenUtil.buildToken(user) : request.getRemoteUser());
            return ResponseEntity.ok().body(token);
        } catch (Exception e) {
            log.debug("Error to authenticate", e);
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid authentication");
        }
    }

    private User authenticateOnMongo(String email, String password) throws InvalidUserException, InvalidTenantException {
        User user = mongoDao.findUser(email, password);
        if (user == null || !Status.ACTIVE.equals(user.getStatus())) {
            throw new InvalidUserException();
        }

        Tenant tenant = mongoDao.findTenant(user);
        if (tenant != null && tenant.getDisabled()) {
            throw new InvalidTenantException();
        }

        return user;
    }

}
