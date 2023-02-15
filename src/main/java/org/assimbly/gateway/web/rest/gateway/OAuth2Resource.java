package org.assimbly.gateway.web.rest.gateway;

import org.assimbly.gateway.db.mongo.MongoDao;
import org.assimbly.gateway.variables.domain.GlobalEnvironmentVariable;
import org.assimbly.gateway.variables.utils.GlobalEnvironmentUtils;
import org.assimbly.util.exception.OAuth2TokenException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for managing oauth2 (Open Authorization v2).
 */
@RestController
@RequestMapping("/api/oauth2token")
public class OAuth2Resource {

    private static final Logger log = LoggerFactory.getLogger(OAuth2Resource.class);

    private MongoDao mongoDao = new MongoDao();

    public static String OAUTH2_PREFIX = "oauth2_";
    public static String OAUTH2_URI_TOKEN_SUFFIX = "_uri_token";
    public static String OAUTH2_SCOPE_SUFFIX = "_scope";
    public static String OAUTH2_CLIENT_ID_SUFFIX = "_client_id";
    public static String OAUTH2_CLIENT_SECRET_SUFFIX = "_client_secret";
    public static String OAUTH2_EXPIRE_DATE_SUFFIX = "_expire_date";
    public static String OAUTH2_ACCESS_TOKEN_SUFFIX = "_access_token";
    public static String OAUTH2_REFRESH_TOKEN_SUFFIX = "_refresh_token";
    public static String OAUTH2_REFRESH_FLAG_SUFFIX = "_refresh_flag";
    public static String OAUTH2_REDIRECT_URI_SUFFIX = "_redirect_uri";

    private static String SERVICE_PARAM_EXPIRES_IN = "expires_in";
    private static String SERVICE_PARAM_ACCESS_TOKEN = "access_token";
    private static String SERVICE_PARAM_REFRESH_TOKEN = "refresh_token";
    private static String SERVICE_PARAM_ERROR = "error";
    private static String SERVICE_PARAM_ERROR_DESCRIPTION = "error_description";

    /**
     * GET  /info : registers two-factor authentication by email (using GoogleAuthenticator).
     * @return the ResponseEntity with the location of the QR code to register
     */
    @GetMapping(path = "/info", produces = {"application/json"})
    public Map<String, String> tokenInfo(
        @RequestParam("id") String id,
        @RequestParam("tenant") String tenant,
        @RequestParam("code") String code
    ) {
        log.debug("REST request to register two-factor authentication");

        MongoDao mongoDao = new MongoDao();
        Map<String, String> tokenInfoMap = new HashMap<>();

        tenant = tenant.toLowerCase();
        String environment = System.getProperty("DOVETAIL_ENV");

        // specific global environment variables names
        String uriTokenVarName = OAUTH2_PREFIX + id + OAUTH2_URI_TOKEN_SUFFIX;
        String scopeVarName = OAUTH2_PREFIX + id + OAUTH2_SCOPE_SUFFIX;
        String clientIdVarName = OAUTH2_PREFIX + id + OAUTH2_CLIENT_ID_SUFFIX;
        String clientSecretVarName = OAUTH2_PREFIX + id + OAUTH2_CLIENT_SECRET_SUFFIX;
        String expireDateVarName = OAUTH2_PREFIX + id + OAUTH2_EXPIRE_DATE_SUFFIX;
        String accessTokenVarName = OAUTH2_PREFIX + id + OAUTH2_ACCESS_TOKEN_SUFFIX;
        String refreshTokenVarName = OAUTH2_PREFIX + id + OAUTH2_REFRESH_TOKEN_SUFFIX;
        String refreshFlagVarName = OAUTH2_PREFIX + id + OAUTH2_REFRESH_FLAG_SUFFIX;
        String redirectUriVarName = OAUTH2_PREFIX + id + OAUTH2_REDIRECT_URI_SUFFIX;

        // get global environment variables from a specific id
        GlobalEnvironmentVariable uriTokenGlobVar = mongoDao.findVariableByName(uriTokenVarName, tenant);
        GlobalEnvironmentVariable scopeGlobVar = mongoDao.findVariableByName(scopeVarName, tenant);
        GlobalEnvironmentVariable clientIdGlobVar = mongoDao.findVariableByName(clientIdVarName, tenant);
        GlobalEnvironmentVariable clientSecretGlobVar = mongoDao.findVariableByName(clientSecretVarName, tenant);
        GlobalEnvironmentVariable redirectUriGlobVar = mongoDao.findVariableByName(redirectUriVarName, tenant);

        // check if there's a global variable inside globalVar, and return real value
        String clientId = GlobalEnvironmentUtils.getGlobalEnvironmentValue(clientIdGlobVar, mongoDao, tenant, environment);
        String clientSecret = GlobalEnvironmentUtils.getGlobalEnvironmentValue(clientSecretGlobVar, mongoDao, tenant, environment);
        String scope = GlobalEnvironmentUtils.getGlobalEnvironmentValue(scopeGlobVar, mongoDao, tenant, environment);
        String redirectUri = GlobalEnvironmentUtils.getGlobalEnvironmentValue(redirectUriGlobVar, mongoDao, tenant, environment);
        String uriToken = GlobalEnvironmentUtils.getGlobalEnvironmentValue(uriTokenGlobVar, mongoDao, tenant, environment);

        // prepare data to send
        String urlParameters  = "client_id=" + clientId +
            (scope!=null && !scope.trim().equals("") ? "&scope="+scope : "") + "&redirect_uri="+redirectUri +
            "&grant_type=authorization_code" + "&client_secret="+clientSecret + "&code="+code;

        // call service
        callService(tokenInfoMap, uriToken, urlParameters);

        // save token info into global vars
        GlobalEnvironmentUtils.saveGlobalEnvironmentVariable(expireDateVarName, mongoDao, tenant, environment,
            tokenInfoMap, SERVICE_PARAM_EXPIRES_IN
        );
        GlobalEnvironmentUtils.saveGlobalEnvironmentVariable(accessTokenVarName, mongoDao, tenant, environment,
            tokenInfoMap, SERVICE_PARAM_ACCESS_TOKEN
        );
        GlobalEnvironmentUtils.saveGlobalEnvironmentVariable(refreshTokenVarName, mongoDao, tenant, environment,
            tokenInfoMap, SERVICE_PARAM_REFRESH_TOKEN
        );

        // set refresh flag to inactive
        GlobalEnvironmentUtils.setRefreshFlagGlobalEnvironmentVariable(refreshFlagVarName, mongoDao, tenant,
            environment, "0");

        // return token info hashmap
        return tokenInfoMap;

    }

    // call service
    private static void callService(Map<String, String> tokenInfoMap, String uriToken, String urlParameters) {

        HttpURLConnection con = null;

        try {
            URL url = null;
            InputStream stream = null;
            String tokenInfoResp = null;

            // prepare connection
            url = new URL(uriToken);
            con = (HttpURLConnection) url.openConnection();
            con.setDoOutput(true);
            con.setInstanceFollowRedirects(false);
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            con.setUseCaches(false);

            // get token info from uri_token service
            OutputStreamWriter wr = new OutputStreamWriter(con.getOutputStream());
            wr.write(urlParameters);
            wr.flush();

            int codeResp = con.getResponseCode();
            if (codeResp >= 200 && codeResp < 400) {
                stream = con.getInputStream();
            } else {
                stream = con.getErrorStream();
            }

            BufferedReader reader = new BufferedReader(new InputStreamReader(stream, "UTF-8"), 8);
            tokenInfoResp = reader.readLine();

            if (tokenInfoResp != null) {
                JSONObject tokenInfoJson = new JSONObject(tokenInfoResp);
                if (!tokenInfoJson.isNull(SERVICE_PARAM_ERROR)) {
                    String error = tokenInfoJson.getString(SERVICE_PARAM_ERROR);
                    String errorDescription = tokenInfoJson.getString(SERVICE_PARAM_ERROR_DESCRIPTION);
                    throw new OAuth2TokenException(error + " - " + errorDescription);
                } else {
                    // expire_date
                    Calendar nowCal = Calendar.getInstance();
                    int expiresIn = tokenInfoJson.getInt(SERVICE_PARAM_EXPIRES_IN);
                    nowCal.add(Calendar.SECOND, expiresIn);
                    // access_token
                    String accessToken = tokenInfoJson.getString(SERVICE_PARAM_ACCESS_TOKEN);
                    // refresh_token
                    String refreshToken = tokenInfoJson.getString(SERVICE_PARAM_REFRESH_TOKEN);
                    // add token info into hashmap
                    tokenInfoMap.put(SERVICE_PARAM_EXPIRES_IN, String.valueOf(nowCal.getTimeInMillis()));
                    tokenInfoMap.put(SERVICE_PARAM_ACCESS_TOKEN, accessToken);
                    tokenInfoMap.put(SERVICE_PARAM_REFRESH_TOKEN, refreshToken);
                }
            }

        } catch (IOException e) {
            log.error("Error calling the service, with the following parameters: "+urlParameters, e);
        } finally {
            if (con != null) {
                con.disconnect();
            }
        }
    }

}
