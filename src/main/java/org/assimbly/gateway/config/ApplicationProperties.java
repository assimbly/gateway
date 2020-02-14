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
	
	public final Info info = new Info();
    public final Documentation documentation = new Documentation();
    public final Gateway gateway = new Gateway();

    public Info getInfo() {
        return info;
    }
    
    public Documentation getDocumentation() {
        return documentation;
    }

    public Gateway getGateway() {
        return gateway;
    }
    
    public static class Info {

    	private String version;

    	
        public String getVersion() {
            return version;
        }

        public void setVersion(String version) {
            this.version = version;
        }
        
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

    public static class Gateway {

    	private String name;
    	private String baseDirectory;
    	
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getBaseDirectory() {
            return baseDirectory;
        }

        public void setBaseDirectory(String baseDirectory) {
            this.baseDirectory = baseDirectory;
        }
    }
    
    
}
