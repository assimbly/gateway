package org.assimbly.gateway.db.mongo;

import com.mongodb.MongoClient;
import org.mongodb.morphia.Datastore;
import org.mongodb.morphia.Morphia;

import java.io.Serializable;

/**
 * A Singleton class for maintaining a connection to the MongoDatabase.
 * This Client connection is set up once it is requested for the first time.
 */

class MongoClientProvider implements Serializable {

    private static final MongoClientProvider INSTANCE = new MongoClientProvider();

    private MongoClient client;
    private Morphia morphia;

    static MongoClientProvider getInstance() {
        return INSTANCE;
    }

    /**
     * Get the Mongo database represented as a Morphia Datastore by the given name.
     *
     * @param name of the database to get.
     * @return the database represented as a Datastore.
     */
    Datastore getDatastore(String name) {
        if (morphia == null || client == null) {
            init();
        }

        Datastore datastore = morphia.createDatastore(client, name);
        datastore.ensureIndexes();

        return datastore;
    }

    /**
     * Initialize Morphia and the the MongoClient.
     * Point Morphia to the domain package.
     */
    private void init() {
        morphia = new Morphia();
        morphia.mapPackage("world.dovetail.auth.domain");

        client = new MongoClient("flux-mongo", 27017);
    }
}

