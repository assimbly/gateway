package org.assimbly.gateway.web.rest.util;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Utility class for handling pagination.
 *
 * <p>
 * Pagination uses the same principles as the <a href="https://developer.github.com/v3/#pagination">GitHub API</a>,
 * and follow <a href="https://tools.ietf.org/html/rfc5988">RFC 5988 (Link header)</a>.
 */
public final class PaginationUtil {

    private PaginationUtil() {
    }

    public static <T> HttpHeaders generatePaginationHttpHeaders(Page<T> page, String baseUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", Long.toString(page.getTotalElements()));

        StringBuilder link = new StringBuilder();

        if ((page.getNumber() + 1) < page.getTotalPages()) {
            link.append("<").append(generateUri(baseUrl, page.getNumber() + 1, page.getSize())).append(">; rel=\"next\",");
        }
        if (page.getNumber() > 0) {
            link.append("<").append(generateUri(baseUrl, page.getNumber() - 1, page.getSize())).append(">; rel=\"prev\",");
        }

        int lastPage = page.getTotalPages() > 0 ? page.getTotalPages() - 1 : 0;

        link.append("<").append(generateUri(baseUrl, lastPage, page.getSize())).append(">; rel=\"last\",");
        link.append("<").append(generateUri(baseUrl, 0, page.getSize())).append(">; rel=\"first\"");

        headers.add(HttpHeaders.LINK, link.toString());
        return headers;
    }
    private static String generateUri(String baseUrl, int page, int size) {
        return UriComponentsBuilder.fromUriString(baseUrl).queryParam("page", page).queryParam("size", size).toUriString();
    }

}
