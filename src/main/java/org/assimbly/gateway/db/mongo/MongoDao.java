package org.assimbly.gateway.db.mongo;

import org.assimbly.gateway.exception.EnvironmentValueNotFoundException;
import org.assimbly.gateway.variables.domain.EnvironmentValue;
import org.assimbly.gateway.variables.domain.TenantVariable;
import org.bson.types.ObjectId;
import org.mongodb.morphia.Datastore;
import org.mongodb.morphia.query.FindOptions;
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

    private static final String TENANT_VARIABLE_EXPRESSION = "@\\{(.*?)}";

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
            .get(new FindOptions());
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

    static public TenantVariable findVariableByName(String variableName, String tenant) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(tenant);
        return datastore.find(TenantVariable.class).field(NAME_FIELD).equal(variableName).get();
    }

    static public String getTenantVariableValue(String tenantVarName, String tenant, String environment) {

        TenantVariable tenantVar = MongoDao.findVariableByName(tenantVarName, tenant);
        if(tenantVar==null) {
            LOG.info(String.format("tenantVar %s is NULL", tenantVarName));
            return null;
        }

        StringBuffer output = new StringBuffer();
        String tenantVariableValue = tenantVar.find(environment)
            .orElseThrow(() -> new EnvironmentValueNotFoundException("Tenant variable (" + tenantVarName + ") value not found for environment: " + environment))
            .getValue();

        Pattern pattern = Pattern.compile(TENANT_VARIABLE_EXPRESSION);
        Matcher matcher = pattern.matcher(tenantVariableValue);

        while(matcher.find()) {
            String internalTenantVarName = matcher.group(1);

            TenantVariable internalTenantVar = findVariableByName(internalTenantVarName, tenant);
            if(internalTenantVar != null) {
                Optional<EnvironmentValue> optionalEnvironmentValue = internalTenantVar.find(environment);
                if(optionalEnvironmentValue.isPresent()) {
                    internalTenantVarName = optionalEnvironmentValue.get().getValue();
                } else {
                    internalTenantVarName = "";
                }
            } else {
                internalTenantVarName = "";
            }

            matcher.appendReplacement(output, Matcher.quoteReplacement(internalTenantVarName));
        }
        matcher.appendTail(output);
        return output.toString();
    }

    static public void saveTenantVariable(
        String tenantVarName, String tenantVarValue, String tenant, String environment
    ) {
        TenantVariable tenantVariable = findVariableByName(tenantVarName, tenant);

        if(Objects.isNull(tenantVariable)) {
            tenantVariable = new TenantVariable(tenantVarName);
            tenantVariable.setCreatedAt(new Date().getTime());
            tenantVariable.setCreatedBy(CREATED_BY_SYSTEM);
        }

        if(!tenantVariable.find(environment).isPresent())
            tenantVariable.put(new EnvironmentValue(environment));

        EnvironmentValue variable = tenantVariable.find(environment).get();

        variable.setEncrypted(false);
        variable.setValue(tenantVarValue);
        variable.setUpdatedAt(new Date().getTime());
        variable.setUpdatedBy(UPDATED_BY_SYSTEM);

        updateTenantVariable(tenantVariable, tenant);
    }

    static public void updateAuthenticatorSettings(User user, String secretKey, Boolean usesTwoFactor) {
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        UpdateOperations<User> operations = datastore.createUpdateOperations(User.class)
                .set("secret_key", secretKey)
                .set("uses_two_factor", usesTwoFactor);

        datastore.update(user, operations);
    }

    static public void updateTenantVariable(TenantVariable tenantVariable, String tenant){
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(tenant);
        datastore.save(tenantVariable);
    }

    static public void removeAuthenticatorSettings(User user){
        Datastore datastore = MongoClientProvider.getInstance().getDatastore(database);

        UpdateOperations<User> operations = datastore.createUpdateOperations(User.class)
                .unset("secret_key")
                .set("uses_two_factor", false);

        datastore.update(user, operations);
    }

}
