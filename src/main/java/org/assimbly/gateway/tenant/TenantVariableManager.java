package org.assimbly.gateway.tenant;


import org.assimbly.gateway.db.mongo.MongoDao;
import org.assimbly.gateway.variables.domain.TenantVariable;

public class TenantVariableManager {

    private static final String STATIC_TENANT_VARIABLE_SUFFIX = "_"+ TenantVariable.TenantVarType.StaticTenantVariable.name();

    public static String getTenantVariableValue(String tokenName, String tenant, String environment) {
        return MongoDao.getTenantVariableValue(tokenName, tenant, environment);
    }

    public static String discoverAndGetTenantVariableValue(String tokenName, String tenant, String environment) {
        TenantVariable.TenantVarType tenantVarType = TenantVariable.TenantVarType.TenantVariable;

        if(isStaticTenantVariable(tokenName)) {
            tokenName = getStaticTenantVariableName(tokenName);
            tenantVarType = TenantVariable.TenantVarType.StaticTenantVariable;
        }

        return MongoDao.getTenantVariableValue(tokenName, tenant, environment, tenantVarType);
    }

    public static void saveTenantVariable(String tokenName, String accessToken, String tenant, String environment) {
        MongoDao.saveTenantVariable(tokenName, accessToken, tenant, environment);
    }

    public static void discoverAndSaveTenantVariable(String tokenName, String accessToken, String tenant, String environment) {
        TenantVariable.TenantVarType tenantVarType = TenantVariable.TenantVarType.TenantVariable;

        if(TenantVariableManager.isStaticTenantVariable(tokenName)) {
            tokenName = getStaticTenantVariableName(tokenName);
            tenantVarType = TenantVariable.TenantVarType.StaticTenantVariable;
        }

        MongoDao.saveTenantVariable(tokenName, accessToken, tenant, environment, tenantVarType);
    }

    public static boolean isStaticTenantVariable(String tokenName) {
        return tokenName.endsWith(STATIC_TENANT_VARIABLE_SUFFIX);
    }

    private static String getStaticTenantVariableName(String tokenName) {
        int index = tokenName.indexOf(STATIC_TENANT_VARIABLE_SUFFIX);
        return tokenName.substring(0, index);
    }

}
