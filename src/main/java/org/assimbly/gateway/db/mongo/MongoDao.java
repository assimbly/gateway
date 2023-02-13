package org.assimbly.gateway.db.mongo;

import org.assimbly.gateway.variables.domain.GlobalEnvironmentVariable;
import org.bson.types.ObjectId;
import org.mongodb.morphia.Datastore;
import org.mongodb.morphia.query.UpdateOperations;
import org.assimbly.gateway.authenticate.domain.Tenant;
import org.assimbly.gateway.authenticate.domain.User;

public class MongoDao {

    private static final String ID_FIELD = "_id";
    private static final String NAME_FIELD = "name";
    private static final String EMAIL_FIELD = "email";
    private static final String PW_FIELD = "password_digest";

    private String database;

    public MongoDao(){
    }

    public MongoDao(String database){
        this.database = database;
    }

    /**
     * Find the user belonging to the given email and password in the
     * database belonging to the given tenant.
     *
     * @param email    of the user to find.
     * @param password of the user to find.
     * @return a User object representing the user if found, otherwise null.
     */
    public User findUser(String email, String password) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        return datastore.createQuery(User.class)
                .field(EMAIL_FIELD).equal(email)
                .field(PW_FIELD).equal(password)
                .get();
    }

    public User findUser(String id) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        return datastore.createQuery(User.class)
                .field(ID_FIELD).equal(new ObjectId(id))
                .get();
    }

    public User findUserByEmail(String email) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        return datastore.createQuery(User.class)
                .field(EMAIL_FIELD).equal(email)
                .get();
    }

    public Tenant findTenant(User user) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        return datastore.createQuery(Tenant.class)
                .field(ID_FIELD).equal(user.getTenantId())
                .get();
    }

    public void updateAuthenticatorSettings(User user, String secretKey, Boolean usesTwoFactor) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        UpdateOperations<User> operations = datastore.createUpdateOperations(User.class)
                .set("secret_key", secretKey)
                .set("uses_two_factor", usesTwoFactor);

        datastore.update(user, operations);
    }

    public void removeAuthenticatorSettings(User user){
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        UpdateOperations<User> operations = datastore.createUpdateOperations(User.class)
                .unset("secret_key")
                .set("uses_two_factor", false);

        datastore.update(user, operations);
    }

    public GlobalEnvironmentVariable findVariableByName(String variableName, String tenant) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(tenant);
        return datastore.find(GlobalEnvironmentVariable.class).field(NAME_FIELD).equal(variableName).get();
    }

    public void updateVariable(GlobalEnvironmentVariable globalEnvironmentVariable, String tenant){
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(tenant);
        datastore.save(globalEnvironmentVariable);
    }

}
