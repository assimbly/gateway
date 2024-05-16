package org.assimbly.gateway.db.mongo;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.springframework.context.annotation.Configuration;

import java.io.Serializable;
import java.util.Arrays;

/**
 * A Singleton class for maintaining a connection to the MongoDatabase.
 * This Client connection is set up once it is requested for the first time.
 */

@Configuration
public class MongoClientProvider implements Serializable {

    private static final MongoClientProvider INSTANCE = new MongoClientProvider();

    private static MongoClient client;

    public static MongoClientProvider getInstance() {
        return INSTANCE;
    }

    public static MongoClient getClient() {
        return client;
    }

    /**
     * Get the `flux_production` Mongo database.
     *
     * @return the database.
     */
    MongoDatabase getDatabase(String name) {
        if (client == null) {
            init();
        }
        return client.getDatabase(name);
    }

    /**
     * Initialize the MongoClient.
     */
    private void init() {
        client = MongoClients.create(MongoClientSettings.builder()
            .applyToClusterSettings(builder ->
                builder.hosts(Arrays.asList(new ServerAddress("flux-mongo", 27017))))
            .build());
    }

}
