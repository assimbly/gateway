package org.assimbly.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Gateway.
 * <p>
 * Properties are configured in the application.yml file.
 * See {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {
	
    public final Documentation documentation = new Documentation();

    public Documentation getDocumentation() {
        return documentation;
    }

    public static class Documentation {

    	private String url;
    	private String camelUrl;
    	
        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getCamelUrl() {
            return camelUrl;
        }

        public void setCamelUrl(String camelUrl) {
            this.camelUrl = camelUrl;
        }
        
    }

}
