package org.assimbly.gateway.web.rest.headless;

import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.ws.rs.core.Response;
import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.builder.TemplatedRouteBuilder;
import org.apache.camel.component.mail.MailAuthenticator;
import org.apache.commons.lang3.StringUtils;
import org.assimbly.dil.blocks.beans.OAuth2MailAuthenticator;
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
import tools.jackson.databind.ObjectMapper;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.UUID;

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
            final String routeId = "dynamic-send-email-route";
            final String triggerUri = "direct:" + routeId + "-trigger";
            boolean isBasicAuth = StringUtils.isNoneEmpty(emailRequest.getTypeAuth())
                && emailRequest.getTypeAuth().equalsIgnoreCase("basic");

            CamelContext context = integrationRuntime.getIntegration().getContext();
            String beanId = null;

            TemplatedRouteBuilder trb = TemplatedRouteBuilder.builder(context, "smtp-action")
                .routeId(routeId)
                .parameter("stepId", "adhoc")
                .parameter("in", triggerUri)
                .parameter("scheme", emailRequest.getProtocol())
                .parameter("path", "%s:%d".formatted(emailRequest.getHost(), emailRequest.getPort()))
                .parameter("subject", emailRequest.getSubject())
                .parameter("to", emailRequest.getTo())
                .parameter("from", emailRequest.getFrom())
                .parameter("username", emailRequest.getUsername())
                .parameter("contentType", emailRequest.getContentType());

            if (isBasicAuth) {
                trb.parameter("password", emailRequest.getPassword());
            } else {
                String accessToken = getAccessToken(emailRequest);
                if (accessToken == null) {
                    throw new Exception("AccessToken is empty!");
                }

                beanId = "mailAuth-" + UUID.randomUUID();
                MailAuthenticator authenticator =
                    new OAuth2MailAuthenticator(emailRequest.getUsername(), accessToken, "", false);
                context.getRegistry().bind(beanId, authenticator);

                trb.parameter("authMechanisms", "XOAUTH2")
                    .parameter("authEnabled", "true")
                    .parameter("authenticator", "#" + beanId);
            }

            // stop/remove any previous instance of this ad-hoc route
            if (context.getRoute(routeId) != null) {
                context.getRouteController().stopRoute(routeId);
                context.removeRoute(routeId);
            }

            trb.add(); // instantiates the route template into a real route

            try (ProducerTemplate template = context.createProducerTemplate()) {
                template.sendBody(triggerUri, emailRequest.getBody());
            }

            context.getRouteController().stopRoute(routeId);
            context.removeRoute(routeId);

            if (beanId != null) {
                try {
                    context.getRegistry().unbind(beanId);
                } catch (Exception e) {
                    log.warn("Could not unbind temporary mail authenticator bean: {}", beanId, e);
                }
            }

            return Response.status(Response.Status.OK).entity("OK").build();

        } catch (Exception e) {
            log.error("Error to send email", e);
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to send email - " + e.getMessage()).build();
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
