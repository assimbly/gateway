package org.assimbly.gateway.web.rest.gateway;

import org.apache.commons.lang3.StringUtils;
import org.assimbly.gateway.tenant.TenantVariableManager;
import org.assimbly.util.exception.OAuth2TokenException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for managing oauth2 (Open Authorization v2).
 */
@RestController
@RequestMapping("/api/oauth2token")
public class OAuth2Resource {

    private static final Logger log = LoggerFactory.getLogger(OAuth2Resource.class);

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
    public static String OAUTH2_CREDENTIALS_TYPE_URI_SUFFIX = "_credentials_type";
    public static String OAUTH2_TOKEN_TENANT_VAR_SUFFIX = "_token_global_var";

    private static String SERVICE_PARAM_EXPIRES_IN = "expires_in";
    private static String SERVICE_PARAM_ACCESS_TOKEN = "access_token";
    private static String SERVICE_PARAM_REFRESH_TOKEN = "refresh_token";
    private static String SERVICE_PARAM_ERROR = "error";
    private static String SERVICE_PARAM_ERROR_DESCRIPTION = "error_description";

    private static final String GOOGLE_CLIENT_ID = System.getenv("GOOGLE_CLIENT_ID");
    private static final String GOOGLE_CLIENT_SECRET = System.getenv("GOOGLE_CLIENT_SECRET");
    private static final String CREDENTIALS_TYPE_CUSTOM = "custom";

    /**
     * GET  /info : requests oauth2 access token info
     * @return Map token information
     */
    @GetMapping(
        path = "/info",
        produces = {MediaType.APPLICATION_JSON_VALUE}
    )
    public Map<String, String> tokenInfo(
        @RequestParam(value = "id") String id,
        @RequestParam(value = "tenant") String tenant,
        @RequestParam(value = "code") String code
    ) {
        log.debug("REST request to register two-factor authentication");

        Map<String, String> tokenInfoMap = new HashMap<>();

        tenant = tenant.toLowerCase();
        String environment = System.getenv("ASSIMBLY_ENV");

        // specific tenant environment variables names
        String uriTokenVarName = OAUTH2_PREFIX + id + OAUTH2_URI_TOKEN_SUFFIX;
        String scopeVarName = OAUTH2_PREFIX + id + OAUTH2_SCOPE_SUFFIX;
        String clientIdVarName = OAUTH2_PREFIX + id + OAUTH2_CLIENT_ID_SUFFIX;
        String clientSecretVarName = OAUTH2_PREFIX + id + OAUTH2_CLIENT_SECRET_SUFFIX;
        String expireDateVarName = OAUTH2_PREFIX + id + OAUTH2_EXPIRE_DATE_SUFFIX;
        String accessTokenVarName = OAUTH2_PREFIX + id + OAUTH2_ACCESS_TOKEN_SUFFIX;
        String refreshTokenVarName = OAUTH2_PREFIX + id + OAUTH2_REFRESH_TOKEN_SUFFIX;
        String refreshFlagVarName = OAUTH2_PREFIX + id + OAUTH2_REFRESH_FLAG_SUFFIX;
        String redirectUriVarName = OAUTH2_PREFIX + id + OAUTH2_REDIRECT_URI_SUFFIX;
        String credentialsTypeVarName = OAUTH2_PREFIX + id + OAUTH2_CREDENTIALS_TYPE_URI_SUFFIX;
        String tokenTenantVarName = OAUTH2_PREFIX + id + OAUTH2_TOKEN_TENANT_VAR_SUFFIX;

        // check if there's a tenant variable inside tenantVar, and return real value
        String scope = TenantVariableManager.getTenantVariableValue(scopeVarName, tenant, environment);
        String clientId = TenantVariableManager.getTenantVariableValue(clientIdVarName, tenant, environment);
        String clientSecret = TenantVariableManager.getTenantVariableValue(clientSecretVarName, tenant, environment);
        String redirectUri = TenantVariableManager.getTenantVariableValue(redirectUriVarName, tenant, environment);
        String uriToken = TenantVariableManager.getTenantVariableValue(uriTokenVarName, tenant, environment);
        String credentialsType = TenantVariableManager.getTenantVariableValue(credentialsTypeVarName, tenant, environment);
        String tokenTenantVar = TenantVariableManager.getTenantVariableValue(tokenTenantVarName, tenant, environment);

        boolean customCredentialsType = StringUtils.isEmpty(credentialsType) ||
            credentialsType.equals(CREDENTIALS_TYPE_CUSTOM);

        // prepare data to send
        String urlParameters  = "client_id="+(customCredentialsType ? clientId : GOOGLE_CLIENT_ID)+
            (scope!=null && !scope.trim().equals("") ? "&scope="+scope : "")+
            "&redirect_uri="+redirectUri+
            "&grant_type=authorization_code"+
            "&client_secret="+(customCredentialsType ? clientSecret : GOOGLE_CLIENT_SECRET)+
            "&code="+code;

        // call service
        callService(tokenInfoMap, uriToken, urlParameters);

        // save token info into tenant vars
        String expiresIn = tokenInfoMap.get(SERVICE_PARAM_EXPIRES_IN);
        if(expiresIn!=null && !expiresIn.isEmpty()) {
            TenantVariableManager.saveTenantVariable(expireDateVarName, expiresIn, tenant, environment);
        }
        String accessToken = tokenInfoMap.get(SERVICE_PARAM_ACCESS_TOKEN);
        if(accessToken!=null && !accessToken.isEmpty()) {
            TenantVariableManager.saveTenantVariable(accessTokenVarName, accessToken, tenant, environment);
            TenantVariableManager.discoverAndSaveTenantVariable(tokenTenantVar, accessToken, tenant, environment);
        }
        String refreshToken = tokenInfoMap.get(SERVICE_PARAM_REFRESH_TOKEN);
        if(refreshToken!=null && !refreshToken.isEmpty()) {
            TenantVariableManager.saveTenantVariable(refreshTokenVarName, refreshToken, tenant, environment);
        }

        // set refresh flag to inactive
        TenantVariableManager.saveTenantVariable(refreshFlagVarName, "0", tenant, environment);

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

            BufferedReader reader = new BufferedReader(new InputStreamReader(stream, "UTF-8"));
            tokenInfoResp = reader.lines().collect(Collectors.joining(System.lineSeparator()));

            if (tokenInfoResp != null) {
                JSONObject tokenInfoJson = new JSONObject(tokenInfoResp);
                if (!tokenInfoJson.isNull(SERVICE_PARAM_ERROR)) {
                    log.info("tokenInfoResp > "+tokenInfoResp);
                    String error = (
                        tokenInfoJson.has(SERVICE_PARAM_ERROR) ? tokenInfoJson.getString(SERVICE_PARAM_ERROR) : ""
                    );
                    String errorDescription = (
                        tokenInfoJson.has(SERVICE_PARAM_ERROR_DESCRIPTION) ?
                            tokenInfoJson.getString(SERVICE_PARAM_ERROR_DESCRIPTION) : ""
                    );
                    throw new OAuth2TokenException(error + " - " + errorDescription);
                } else {
                    // expire_date
                    Calendar nowCal = Calendar.getInstance();
                    int expiresIn = tokenInfoJson.getInt(SERVICE_PARAM_EXPIRES_IN);
                    nowCal.add(Calendar.SECOND, expiresIn);
                    // access_token
                    String accessToken = tokenInfoJson.getString(SERVICE_PARAM_ACCESS_TOKEN);
                    // refresh_token
                    String refreshToken = tokenInfoJson.optString(SERVICE_PARAM_REFRESH_TOKEN);
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
