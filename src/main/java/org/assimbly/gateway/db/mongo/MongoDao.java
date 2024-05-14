package org.assimbly.gateway.db.mongo;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.assimbly.gateway.authenticate.domain.Tenant;
import org.assimbly.gateway.authenticate.domain.User;
import org.assimbly.gateway.exception.EnvironmentValueNotFoundException;
import org.assimbly.gateway.variables.domain.EnvironmentValue;
import org.assimbly.gateway.variables.domain.TenantVariable;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MongoDao {

    private static final Logger LOG = LoggerFactory.getLogger(MongoDao.class);

    private static final String CREATED_BY_SYSTEM = "System";
    private static final String UPDATED_BY_SYSTEM = "System";

    private static final String TENANT_VARIABLE_EXPRESSION = "@\\{(.*?)}";

    private static String database;

    public MongoDao(){
    }

    public MongoDao(String databaseName) {
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
        MongoDatabase mongoDatabase = MongoClientProvider.getInstance().getDatabase(database);

        Document query = new Document(User.EMAIL_FIELD, email).append(User.PASSWORD_DIGEST_FIELD, password);
        Document userDocument = mongoDatabase.getCollection("users").find(query).first();
        if (userDocument != null) {
            return User.fromDocument(userDocument); // Convert Document to User object
        }
        return null;
    }

    public User findUser(String id) {
        MongoDatabase mongoDatabase = MongoClientProvider.getInstance().getDatabase(database);

        Document query = new Document(User.ID_FIELD, id);
        Document userDocument = mongoDatabase.getCollection("users").find(query).first();
        if (userDocument != null) {
            return User.fromDocument(userDocument); // Convert Document to User object
        }
        return null;
    }

    public User findUserByEmail(String email) {
        MongoDatabase mongoDatabase = MongoClientProvider.getInstance().getDatabase(database);

        Document query = new Document(User.EMAIL_FIELD, email);
        Document userDocument = mongoDatabase.getCollection("users").find(query).first();
        if (userDocument != null) {
            return User.fromDocument(userDocument); // Convert Document to User object
        }
        return null;
    }

    public Tenant findTenant(User user) {
        MongoDatabase mongoDatabase = MongoClientProvider.getInstance().getDatabase(database);

        Document query = new Document(Tenant.ID_FIELD, user.getTenantId());
        Document tenantDocument = mongoDatabase.getCollection("tenants").find(query).first();
        if (tenantDocument != null) {
            return Tenant.fromDocument(tenantDocument);
        }
        return null;
    }

    public static TenantVariable findVariableByName(String variableName, String tenant) {
        MongoDatabase mongoDatabase = MongoClientProvider.getInstance().getDatabase(database);

        Document query = new Document(TenantVariable.NAME_FIELD, variableName);
        Document tenantVarsDocument = mongoDatabase.getCollection("tenant_variables").find(query).first();
        if (tenantVarsDocument != null) {
            return TenantVariable.fromDocument(tenantVarsDocument);
        }
        return null;
    }

    public static void updateTenantVariable(TenantVariable tenantVariable, String tenant, boolean tenantVariableExist){
        MongoDatabase mongoDatabase = MongoClientProvider.getInstance().getDatabase(database);

        MongoCollection<Document> collection = mongoDatabase.getCollection("tenant_variables");
        if(tenantVariableExist) {
            collection.replaceOne(new Document(TenantVariable.ID_FIELD, tenantVariable.get_id()), tenantVariable.toDocument());
        } else {
            collection.insertOne(tenantVariable.toDocument());
        }
    }

    public void updateAuthenticatorSettings(User user, String secretKey, Boolean usesTwoFactor) {
        MongoDatabase mongoDatabase = MongoClientProvider.getInstance().getDatabase(database);

        mongoDatabase.getCollection("users").updateOne(new Document(User.ID_FIELD, user.getId()),
            new Document("$set", new Document("secret_key", secretKey)
                .append("uses_two_factor", usesTwoFactor)));
    }

    public void removeAuthenticatorSettings(User user){
        MongoDatabase mongoDatabase = MongoClientProvider.getInstance().getDatabase(database);

        mongoDatabase.getCollection("users").updateOne(new Document(User.ID_FIELD, user.getId()),
            new Document("$unset", new Document("secret_key", "")
                .append("uses_two_factor", false)));
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
        boolean tenantVariableExist = !Objects.isNull(tenantVariable);

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
        variable.setLastUpdate(new Date().getTime());
        variable.setUpdatedBy(UPDATED_BY_SYSTEM);

        updateTenantVariable(tenantVariable, tenant, tenantVariableExist);
    }

}
