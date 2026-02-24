package org.assimbly.gateway.web.rest.headless;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.ws.rs.core.Response;
import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.builder.RouteBuilder;
import org.apache.commons.lang3.StringUtils;
import org.assimbly.gateway.web.rest.mail.EmailRequest;
import org.assimbly.gateway.web.rest.mail.ServiceAccount;
import org.assimbly.integrationrest.IntegrationRuntime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private final IntegrationRuntime integrationRuntime;

    public EmailResource(IntegrationRuntime integrationRuntime) {
        this.integrationRuntime = integrationRuntime;
    }

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

            StringBuilder uriStrBuild = new StringBuilder();
            uriStrBuild.append(String.format("%s://%s:%d?", emailRequest.getProtocol(), emailRequest.getHost(), emailRequest.getPort()));
            uriStrBuild.append(String.format("authenticationType=RAW(%s)", emailRequest.getTypeAuth()));
            uriStrBuild.append("&mail.smtp.starttls.enable=true");
            uriStrBuild.append(String.format("&subject=RAW(%s)", emailRequest.getSubject()));
            uriStrBuild.append(String.format("&to=RAW(%s)", emailRequest.getTo()));
            uriStrBuild.append(String.format("&username=RAW(%s)", emailRequest.getUsername()));
            uriStrBuild.append(String.format("&contentType=RAW(%s)", emailRequest.getContentType()));

            if(StringUtils.isNoneEmpty(emailRequest.getTypeAuth()) && emailRequest.getTypeAuth().equals("basic")) {
                // basic
                uriStrBuild.append(String.format("&password=RAW(%s)", emailRequest.getPassword()));
            } else {
                // oauth
                accessToken = getAccessToken(emailRequest);
                if(accessToken == null) {
                    throw new Exception("AccessToken is empty!");
                }
                uriStrBuild.append(String.format("&accessToken=RAW(%s)", accessToken));
            }

            final String routeId = "dynamic-send-email-route";

            // stop and remove the route if it already exists
            if (context.getRoute(routeId) != null) {
                context.getRouteController().stopRoute(routeId);
                context.removeRoute(routeId);
            }

            context.addRoutes(new RouteBuilder() {
                @Override
                public void configure() throws Exception {
                    from("direct:start")
                        .routeId(routeId)
                        .setHeader("user", constant(emailRequest.getUsername()))
                        .setHeader("From", constant(emailRequest.getFrom()))
                        .to(uriStrBuild.toString());
                }
            });

            try (ProducerTemplate template = context.createProducerTemplate()) {
                template.sendBody("direct:start", emailRequest.getBody());
            }

            // clean up the route after sending
            context.getRouteController().stopRoute(routeId);
            context.removeRoute(routeId);

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

            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccountStream)
                .createScoped(Collections.singleton(emailRequest.getScopes()))
                .createDelegated(emailRequest.getUsername());

            // refresh token if expired
            credentials.refreshIfExpired();

            AccessToken token = credentials.getAccessToken();
            return token.getTokenValue();

        } catch (Exception e) {
            log.error("An error occurred: ", e);
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
