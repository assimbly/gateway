package org.assimbly.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Properties;


@ConfigurationProperties(prefix = "encryption", ignoreUnknownFields = false)
public class EncryptionProperties {

    public final Jasypt jasypt = new Jasypt();

    public Jasypt getJasypt() {
        return jasypt;
    }

    public static class Jasypt {
        private String algorithm;
        private String password;

        public String getAlgorithm() {
            return algorithm;
        }

        public String getPassword() {
            return password;
        }

        public void setAlgorithm(String algorithm) {
            this.algorithm = algorithm;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public Properties getProperties() {
        Properties properties = new Properties();
        properties.setProperty("algorithm", getJasypt().algorithm);
        properties.setProperty("password", getJasypt().password);
        return properties;
    }

}
