package org.assimbly.gateway.db.mongo;

import org.assimbly.gateway.exception.EnvironmentValueNotFoundException;
import org.assimbly.gateway.variables.domain.EnvironmentValue;
import org.assimbly.gateway.variables.domain.GlobalEnvironmentVariable;
import org.bson.types.ObjectId;
import org.mongodb.morphia.Datastore;
import org.mongodb.morphia.query.UpdateOperations;
import org.assimbly.gateway.authenticate.domain.Tenant;
import org.assimbly.gateway.authenticate.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MongoDao {

    private static final Logger LOG = LoggerFactory.getLogger(MongoDao.class);

    private static final String ID_FIELD = "_id";
    private static final String NAME_FIELD = "name";
    private static final String EMAIL_FIELD = "email";
    private static final String PW_FIELD = "password_digest";

    private static final String CREATED_BY_SYSTEM = "System";
    private static final String UPDATED_BY_SYSTEM = "System";

    private static final String GLOBAL_EXPRESSION = "@\\{(.*?)}";

    private static String database;

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
    static public User findUser(String email, String password) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        return datastore.createQuery(User.class)
                .field(EMAIL_FIELD).equal(email)
                .field(PW_FIELD).equal(password)
                .get();
    }

    static public User findUser(String id) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        return datastore.createQuery(User.class)
                .field(ID_FIELD).equal(new ObjectId(id))
                .get();
    }

    static public User findUserByEmail(String email) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        return datastore.createQuery(User.class)
                .field(EMAIL_FIELD).equal(email)
                .get();
    }

    static public Tenant findTenant(User user) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        return datastore.createQuery(Tenant.class)
                .field(ID_FIELD).equal(user.getTenantId())
                .get();
    }

    static public GlobalEnvironmentVariable findVariableByName(String variableName, String tenant) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(tenant);
        return datastore.find(GlobalEnvironmentVariable.class).field(NAME_FIELD).equal(variableName).get();
    }

    static public String getGlobalEnvironmentValue(String globVarName, String tenant, String environment) {

        GlobalEnvironmentVariable globVar = MongoDao.findVariableByName(globVarName, tenant);
        if(globVar==null) {
            LOG.info(String.format("globVar %s is NULL", globVarName));
            return null;
        }

        StringBuffer output = new StringBuffer();
        String globalEnvironmentValue = globVar.find(environment)
            .orElseThrow(() -> new EnvironmentValueNotFoundException("Global variable (" + globVarName + ") value not found for environment: " + environment))
            .getValue();

        Pattern pattern = Pattern.compile(GLOBAL_EXPRESSION);
        Matcher matcher = pattern.matcher(globalEnvironmentValue);

        while(matcher.find()) {
            String internalGlobalVarName = matcher.group(1);

            GlobalEnvironmentVariable internalGlobalVar = findVariableByName(internalGlobalVarName, tenant);
            if(internalGlobalVar != null) {
                Optional<EnvironmentValue> optionalEnvironmentValue = internalGlobalVar.find(environment);
                if(optionalEnvironmentValue.isPresent()) {
                    internalGlobalVarName = optionalEnvironmentValue.get().getValue();
                } else {
                    internalGlobalVarName = "";
                }
            } else {
                internalGlobalVarName = "";
            }

            matcher.appendReplacement(output, Matcher.quoteReplacement(internalGlobalVarName));
        }
        matcher.appendTail(output);
        return output.toString();
    }

    static public void saveGlobalEnvironmentVariable(
        String globVarName, String globVarValue, String tenant, String environment
    ) {
        GlobalEnvironmentVariable globalEnvironmentVariable = findVariableByName(globVarName, tenant);

        if(Objects.isNull(globalEnvironmentVariable)) {
            globalEnvironmentVariable = new GlobalEnvironmentVariable(globVarName);
            globalEnvironmentVariable.setCreatedAt(new Date().getTime());
            globalEnvironmentVariable.setCreatedBy(CREATED_BY_SYSTEM);
        }

        if(!globalEnvironmentVariable.find(environment).isPresent())
            globalEnvironmentVariable.put(new EnvironmentValue(environment));

        EnvironmentValue variable = globalEnvironmentVariable.find(environment).get();

        variable.setEncrypted(false);
        variable.setValue(globVarValue);
        variable.setUpdatedAt(new Date().getTime());
        variable.setUpdatedBy(UPDATED_BY_SYSTEM);

        updateVariable(globalEnvironmentVariable, tenant);
    }

    static public void updateAuthenticatorSettings(User user, String secretKey, Boolean usesTwoFactor) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        UpdateOperations<User> operations = datastore.createUpdateOperations(User.class)
                .set("secret_key", secretKey)
                .set("uses_two_factor", usesTwoFactor);

        datastore.update(user, operations);
    }

    static public void updateVariable(GlobalEnvironmentVariable globalEnvironmentVariable, String tenant){
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(tenant);
        datastore.save(globalEnvironmentVariable);
    }

    static public void removeAuthenticatorSettings(User user){
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        UpdateOperations<User> operations = datastore.createUpdateOperations(User.class)
                .unset("secret_key")
                .set("uses_two_factor", false);

        datastore.update(user, operations);
    }

}
