package org.assimbly.gateway.db.mongo;

import com.warrenstrange.googleauth.ICredentialRepository;
import org.assimbly.gateway.authenticate.domain.User;

import java.util.List;

public class GoogleCredentialsRepository implements ICredentialRepository {

    private MongoDao mongoDao;

    public GoogleCredentialsRepository(String databaseName) {
        mongoDao = new MongoDao(databaseName);
    }

    @Override
    public String getSecretKey(String email) {
        User user = mongoDao.findUserByEmail(email);
        return user.getSecretKey();
    }

    @Override
    public void saveUserCredentials(String email, String secretKey, int validationCode, List<Integer> scratchCodes) {
        User user = mongoDao.findUserByEmail(email);
        mongoDao.updateAuthenticatorSettings(user, secretKey, true);
    }
}
