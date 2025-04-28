package org.assimbly.gateway.web.rest.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.ws.rs.core.Response;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.commons.lang3.StringUtils;
import org.assimbly.gateway.web.rest.mail.EmailRequest;
import org.assimbly.gateway.web.rest.mail.ServiceAccount;
import org.assimbly.integrationrest.IntegrationRuntime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;

/**
 * REST controller for managing oauth2 (Open Authorization v2).
 */
@RestController
@RequestMapping("/api/email")
public class EmailResource {

    private static final Logger log = LoggerFactory.getLogger(EmailResource.class);

    @Autowired
    private IntegrationRuntime integrationRuntime;

    /**
     * GET  /info : requests oauth2 access token info
     * @return Map token information
     */
    @PostMapping(
        path = "/send",
        produces = {MediaType.APPLICATION_JSON_VALUE}
    )
    public Response sendEmail(
        @RequestBody EmailRequest emailRequest
    ) {

        try {

            CamelContext context = integrationRuntime.getIntegration().getContext();
            String accessToken = "";

            StringBuffer uriStrBuf = new StringBuffer();
            uriStrBuf.append(String.format("%s://%s:%d?", emailRequest.getProtocol(), emailRequest.getHost(), emailRequest.getPort()));
            uriStrBuf.append(String.format("authenticationType=RAW(%s)", emailRequest.getTypeAuth()));
            uriStrBuf.append("&mail.smtp.starttls.enable=true");
            uriStrBuf.append(String.format("&subject=RAW(%s)", emailRequest.getSubject()));
            uriStrBuf.append(String.format("&to=RAW(%s)", emailRequest.getTo()));
            uriStrBuf.append(String.format("&username=RAW(%s)", emailRequest.getUsername()));
            uriStrBuf.append(String.format("&contentType=RAW(%s)", emailRequest.getContentType()));

            if(StringUtils.isNoneEmpty(emailRequest.getTypeAuth()) && emailRequest.getTypeAuth().equals("basic")) {
                // basic
                uriStrBuf.append(String.format("&password=RAW(%s)", emailRequest.getPassword()));
            } else {
                // oauth
                accessToken = getAccessToken(emailRequest);
                if(accessToken == null) {
                    throw new Exception("AccessToken is empty!");
                }
                uriStrBuf.append(String.format("&accessToken=RAW(%s)", accessToken));
            }

            final String bearerToken = accessToken;
            context.addRoutes(new RouteBuilder() {
                @Override
                public void configure() throws Exception {
                    from("direct:start")
                        .setHeader("user", constant(emailRequest.getUsername()))
                        .setHeader("Authorization", constant("Bearer "+ bearerToken))
                        .to(uriStrBuf.toString());
                }
            });

            context.createProducerTemplate().requestBody("direct:start", emailRequest.getBody());

            return Response.status(Response.Status.OK).entity("OK").build();

        } catch (Exception e) {
            log.error("Error to send email", e);
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to send email - "+e.getMessage()).build();
        }
    }

    // get access token
    private String getAccessToken(EmailRequest emailRequest) {
        try {
            InputStream serviceAccountStream = convertServiceAccountToInputStream(emailRequest.getServiceAccount());
            if (serviceAccountStream == null) {
                throw new IOException("Service account file not found");
            }

            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccountStream)
                .createScoped(Collections.singleton(emailRequest.getScopes()))
                .createDelegated(emailRequest.getUsername());

            // refresh token if expired
            credentials.refreshIfExpired();

            AccessToken token = credentials.getAccessToken();
            return token.getTokenValue();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // converts serviceAccount Map into a InputStream
    private static InputStream convertServiceAccountToInputStream(ServiceAccount serviceAccount) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonString = objectMapper.writeValueAsString(serviceAccount);
        return new ByteArrayInputStream(jsonString.getBytes());
    }

}
