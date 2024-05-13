package org.assimbly.gateway.db.mongo;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.warrenstrange.googleauth.ICredentialRepository;
import org.bson.Document;

import java.util.List;

public class GoogleCredentialsRepository implements ICredentialRepository {

    private final MongoDatabase database;

    public GoogleCredentialsRepository(MongoClient mongoClient, String databaseName) {
        this.database = mongoClient.getDatabase(databaseName);
    }

    @Override
    public String getSecretKey(String email) {
        MongoCollection<Document> usersCollection = database.getCollection("users");
        Document userDoc = usersCollection.find(Filters.eq("email", email)).first();
        if (userDoc != null) {
            return userDoc.getString("secret_key");
        }
        return null;
    }

    @Override
    public void saveUserCredentials(String email, String secretKey, int validationCode, List<Integer> scratchCodes) {
        MongoCollection<Document> usersCollection = database.getCollection("users");
        usersCollection.updateOne(
            Filters.eq("email", email),
            new Document("$set", new Document("secret_key", secretKey))
                .append("$set", new Document("uses_two_factor", true))
        );
    }
}
