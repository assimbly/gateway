package org.assimbly.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Gateway.
 * <p>
 * Properties are configured in the application.yml file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    public final Info info = new Info();
    public final Documentation documentation = new Documentation();
    public final Gateway gateway = new Gateway();
    public final DeployDirectory deployDirectory = new DeployDirectory();
    //   public final Encryption encryption = new Encryption();


    public Info getInfo() {
        return info;
    }

    public Documentation getDocumentation() {
        return documentation;
    }

    public Gateway getGateway() {
        return gateway;
    }

    public DeployDirectory getDeployDirectory() {
        return deployDirectory;
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
    	private boolean tracing;
    	private boolean debugging;

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

        public boolean getTracing() {
            return tracing;
        }

        public void setName(boolean tracing) {
            this.tracing = tracing;
        }


        public boolean getDebugging() {
            return debugging;
        }

        public void setDebugging(boolean debugging) {
            this.debugging = debugging;
        }

    }

    public static class DeployDirectory {

        private boolean deployOnStart;
        private boolean deployOnChange;

        public boolean getDeployOnStart() {
            return deployOnStart;
        }

        public void setDeployOnStart(boolean deployOnStart) {
            this.deployOnStart = deployOnStart;
        }

        public boolean getDeployOnChange() {
            return deployOnChange;
        }

        public void setDeployOnChange(boolean deployOnChange) {
            this.deployOnChange = deployOnChange;
        }

    }


}
