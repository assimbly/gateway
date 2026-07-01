package org.assimbly.gateway.tenant;


import org.assimbly.gateway.db.mongo.MongoDao;
import org.assimbly.gateway.variables.domain.EnvironmentValue;
import org.assimbly.gateway.variables.domain.TenantVariable;
import org.assimbly.util.EncryptionUtil;

import java.util.Date;

public class TenantVariableManager {

    private static final String STATIC_TENANT_VARIABLE_SUFFIX = "_" + TenantVariable.TenantVarType.StaticTenantVariable.name();

    private static final String ALGORITHM = "PBEWithHMACSHA512AndAES_256";
    private static final String ASSIMBLY_ENCRYPTION_SECRET = System.getenv("ASSIMBLY_ENCRYPTION_SECRET");
    private static final EncryptionUtil encryptionUtil = new EncryptionUtil(ASSIMBLY_ENCRYPTION_SECRET, ALGORITHM);

    public static String getTenantVariableValue(String tokenName, String tenant, String environment) {
        return getDecryptedValue(tokenName, tenant, environment, TenantVariable.TenantVarType.TenantVariable);
    }

    public static String discoverAndGetTenantVariableValue(String tokenName, String tenant, String environment) {
        TenantVariable.TenantVarType tenantVarType = TenantVariable.TenantVarType.TenantVariable;

        if(isStaticTenantVariable(tokenName)) {
            tokenName = getStaticTenantVariableName(tokenName);
            tenantVarType = TenantVariable.TenantVarType.StaticTenantVariable;
        }

        return getDecryptedValue(tokenName, tenant, environment, tenantVarType);
    }

    public static void saveTenantVariable(String tokenName, String accessToken, String tenant, String environment) {
        saveValue(tokenName, accessToken, tenant, environment, TenantVariable.TenantVarType.TenantVariable, true);
    }

    public static void discoverAndSaveTenantVariable(String tokenName, String accessToken, String tenant, String environment) {
        TenantVariable.TenantVarType tenantVarType = TenantVariable.TenantVarType.TenantVariable;

        if(TenantVariableManager.isStaticTenantVariable(tokenName)) {
            tokenName = getStaticTenantVariableName(tokenName);
            tenantVarType = TenantVariable.TenantVarType.StaticTenantVariable;
        }

        saveValue(tokenName, accessToken, tenant, environment, tenantVarType, true);
    }

    public static boolean isStaticTenantVariable(String tokenName) {
        return tokenName.endsWith(STATIC_TENANT_VARIABLE_SUFFIX);
    }

    private static String getStaticTenantVariableName(String tokenName) {
        int index = tokenName.indexOf(STATIC_TENANT_VARIABLE_SUFFIX);
        return tokenName.substring(0, index);
    }

    private static String getDecryptedValue(String tokenName, String tenant, String environment, TenantVariable.TenantVarType tenantVarType) {
        TenantVariable tenantVar = MongoDao.findVariableByName(tokenName, tenant, tenantVarType);
        if (tenantVar == null) {
            return null;
        }

        return tenantVar.find(environment)
            .map(TenantVariableManager::getValueByEnvironmentValue)
            .orElse(null);
    }

    private static void saveValue(String tokenName, String value, String tenant, String environment,
                                  TenantVariable.TenantVarType tenantVarType, boolean encrypt) {
        TenantVariable tenantVariable = MongoDao.findVariableByName(tokenName, tenant, tenantVarType);
        boolean tenantVariableExists = tenantVariable != null;

        if (!tenantVariableExists) {
            tenantVariable = new TenantVariable(tokenName);
            tenantVariable.set_type(tenantVarType.name());
        }

        if (!tenantVariable.find(environment).isPresent()) {
            tenantVariable.put(new EnvironmentValue(environment));
        }

        EnvironmentValue envValue = tenantVariable.find(environment).get();

        if (encrypt) {
            value = encrypt(value);
        }

        envValue.setEncrypted(encrypt);
        envValue.setValue(value);
        envValue.setLastUpdate(new Date().getTime());

        MongoDao.updateTenantVariable(tenantVariable, tenant, tenantVariableExists);
    }

    private static String getValueByEnvironmentValue(EnvironmentValue environmentVar) {
        return (environmentVar.isEncrypted() ? decrypt(environmentVar.getValue()) : environmentVar.getValue());
    }

    private static String decrypt(String encryptedValue) {
        if(!encryptedValue.isEmpty()) {
            return encryptionUtil.decrypt(encryptedValue);
        } else {
            return "";
        }
    }

    private static String encrypt(String value) {
        if(!value.isEmpty()) {
            return encryptionUtil.encrypt(value);
        } else {
            return "";
        }
    }

}
