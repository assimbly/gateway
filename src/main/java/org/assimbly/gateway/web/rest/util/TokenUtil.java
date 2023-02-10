package org.assimbly.gateway.web.rest.util;

import io.undertow.util.BadRequestException;
import org.assimbly.gateway.authenticate.jwt.JwtBuilder;
import org.assimbly.util.helper.Base64Helper;

import java.io.UnsupportedEncodingException;

import static java.nio.charset.StandardCharsets.UTF_8;

public class TokenUtil {

    static public String[] decodeHeader(String base64) throws BadRequestException {
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

    static public String buildToken(org.assimbly.gateway.authenticate.domain.User user) throws UnsupportedEncodingException {
        return JwtBuilder.build(user.getEmail(), "role");
    }

    private static boolean nullOrEmpty(String value) {
        return value == null || value.isEmpty();
    }
}
