package org.assimbly.gateway.variables.utils;

import org.assimbly.gateway.db.mongo.MongoDao;
import org.assimbly.gateway.variables.domain.EnvironmentValue;
import org.assimbly.gateway.variables.domain.GlobalEnvironmentVariable;

import java.util.Date;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GlobalEnvironmentUtils {

    public static String CREATED_BY = "System";
    public static String UPDATED_BY = "System";

    private static String GLOBAL_EXPRESSION = "@\\{(.*?)}";

    // save global environment variable
    public static void saveGlobalEnvironmentVariable(
            String globalVarName,
            MongoDao mongoDao,
            String tenant,
            String environment,
            Map<String, String> tokenInfoMap,
            String tokenInfoVar
    ) {
        GlobalEnvironmentVariable globalEnvironmentVariable = mongoDao.findVariableByName(globalVarName, tenant);

        if(Objects.isNull(globalEnvironmentVariable)) {
            globalEnvironmentVariable = new GlobalEnvironmentVariable(globalVarName);
            globalEnvironmentVariable.setCreatedAt(new Date().getTime());
            globalEnvironmentVariable.setCreatedBy(CREATED_BY);
        }

        if(!globalEnvironmentVariable.find(environment).isPresent())
            globalEnvironmentVariable.put(new EnvironmentValue(environment));

        EnvironmentValue variable = globalEnvironmentVariable.find(environment).get();

        variable.setEncrypted(false);
        variable.setValue(tokenInfoMap!=null ? tokenInfoMap.get(tokenInfoVar) : tokenInfoVar);
        variable.setUpdatedAt(new Date().getTime());
        variable.setUpdatedBy(UPDATED_BY);

        mongoDao.updateVariable(globalEnvironmentVariable, tenant);
    }

    // save refresh flag global environment variable
    public static void setRefreshFlagGlobalEnvironmentVariable(
            String globalVarName,
            MongoDao mongoDao,
            String tenant,
            String environment,
            String flag
    ) {
        saveGlobalEnvironmentVariable(globalVarName, mongoDao, tenant, environment, null, flag);
    }

    //
    public static String getGlobalEnvironmentValue(
            GlobalEnvironmentVariable globalEnvironmentVariable,
            MongoDao mongoDao,
            String tenant,
            String environment
    ) {
        StringBuffer output = new StringBuffer();
        String globalEnvironmentValue = globalEnvironmentVariable.find(environment).get().getValue();

        Pattern pattern = Pattern.compile(GLOBAL_EXPRESSION);
        Matcher matcher = pattern.matcher(globalEnvironmentValue);

        while(matcher.find()) {
            String internalGlobalVarName = matcher.group(1);

            GlobalEnvironmentVariable internalGlobalVar = mongoDao.findVariableByName(internalGlobalVarName, tenant);
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

}
