package org.assimbly.gateway.web.rest.gateway;

import io.swagger.annotations.ApiParam;
import org.assimbly.util.BaseDirectory;
import org.assimbly.util.CertificatesUtil;
import org.assimbly.util.rest.ResponseUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;


/**
 * REST controller for managing Security.
 */
@RestController
@RequestMapping("/api")
public class CertificateResource {

    private final Logger log = LoggerFactory.getLogger(CertificateResource.class);

    private final String baseDir = BaseDirectory.getInstance().getBaseDirectory();

    /**
     * POST  /certificates : import a new certificates.
     *
     * @param url the url to get the certificates
     * @return the ResponseEntity<String> with status 200 (Imported) and with body (certificates), or with status 400 (Bad Request) if the certificates failed to import
     * @throws Exception
     */
    @PostMapping(path = "/certificates/import", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> importCertificates(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @RequestBody String url, @RequestHeader String keystoreName, @RequestHeader String keystorePassword) throws Exception {

        log.debug("REST request to import certificates for url: {}", url);

        try {

            Certificate[] certificates = getCertificates(url);
            Map<String,Certificate> certificateMap = importCertificatesInKeystore(keystoreName, keystorePassword, certificates);

            String result = certificatesAsJSon(certificateMap, url, keystoreName);

            return org.assimbly.util.rest.ResponseUtil.createSuccessResponse(1, mediaType, "/certificates/import", result);

        } catch (Exception e) {
            log.error("Can't import certificates into keystore.", e);
            return org.assimbly.util.rest.ResponseUtil.createFailureResponse(1, mediaType, "/certificates/import", e.getMessage());
        }

    }


    @PostMapping(path = "/certificates/upload", consumes = {"text/plain"}, produces = {"text/plain","application/xml", "application/json"})
    public ResponseEntity<String> uploadCertificate(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,@ApiParam(hidden = true) @RequestHeader("Content-Type") String contentType, @RequestHeader("FileType") String fileType, @RequestHeader String keystoreName, @RequestHeader String keystorePassword, @RequestBody String certificate) throws Exception {

        try {

            Certificate cert;
            if(fileType.equalsIgnoreCase("pem")) {
                CertificatesUtil util = new CertificatesUtil();
                cert = util.convertPemToX509Certificate(certificate);
            }else if(fileType.equalsIgnoreCase("p12")){
                return ResponseUtil.createFailureResponse(1L, mediaType,"/certificates/upload","use the p12 uploader");
            }else{
                //create certificate from String
                CertificateFactory cf = CertificateFactory.getInstance("X.509");
                InputStream certificateStream = new ByteArrayInputStream(certificate.getBytes());
                cert = cf.generateCertificate(certificateStream);
            }

            Certificate[] certificates = new X509Certificate[1];
            certificates[0] = cert;

            Map<String,Certificate> certificateMap = importCertificatesInKeystore(keystoreName, keystorePassword, certificates);

            String result = certificatesAsJSon(certificateMap, null, keystoreName);

            log.debug("Uploaded certificate: " + cert);

            return org.assimbly.util.rest.ResponseUtil.createSuccessResponse(1, mediaType, "/certificates/upload", result);


        } catch (Exception e) {
            log.debug("Uploaded certificate failed: ", e.getMessage());
            return org.assimbly.util.rest.ResponseUtil.createFailureResponse(1, mediaType, "/certificates/upload", e.getMessage());
        }

    }

    @PostMapping(path = "/certificates/uploadp12", consumes = {"text/plain"}, produces = {"text/plain","application/xml", "application/json"})
    public ResponseEntity<String> uploadP12Certificate(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,@ApiParam(hidden = true) @RequestHeader("Content-Type") String contentType, @RequestHeader("FileType") String fileType, @RequestHeader String keystoreName, @RequestHeader String keystorePassword, @RequestHeader("password") String password, @RequestBody String certificate) throws Exception {

        try {

            Map<String,Certificate> certificateMap = importP12CertificateInKeystore(keystoreName, keystorePassword, certificate, password);

            String result = certificatesAsJSon(certificateMap, "P12", keystoreName);

            log.debug("Uploaded P12 certificate");

            return ResponseUtil.createSuccessResponse(1L, mediaType,"/securities/uploadcertificate",result);
        } catch (Exception e) {
            log.debug("Uploaded certificate failed: ", e.getMessage());
            return ResponseUtil.createFailureResponse(1L, mediaType,"/securities/uploadcertificate",e.getMessage());
        }

    }

    @GetMapping(path = "/certificates/generate", produces = {"text/plain","application/xml", "application/json"})
    public ResponseEntity<String> generateCertificate(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @RequestHeader("cn") String cn, @RequestHeader String keystoreName, @RequestHeader String keystorePassword) throws Exception {

        try {

            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(4096, new SecureRandom());
            KeyPair keyPair = keyPairGenerator.generateKeyPair();

            CertificatesUtil util = new CertificatesUtil();
            //X509Certificate cert = util.selfsignCertificate(keyPair, "SHA256withRSA", cn, 730);

            Certificate cert = util.selfsignCertificate2(keyPair, cn);

            importCertificateInKeystore(keystoreName, keystorePassword, cn, cert);

            Map<String,Certificate> certificateMap = new HashMap<String,Certificate>();
            certificateMap.put("Self-Signed (" + cn + ")",cert);

            String result = certificatesAsJSon(certificateMap, null, keystoreName);

            log.debug("Generated certificate: " + cert);

            return org.assimbly.util.rest.ResponseUtil.createSuccessResponse(1, mediaType, "/certificates/generate", result);


        } catch (Exception e) {
            log.debug("Generate self-signed certificate failed: ", e.getMessage());
            return org.assimbly.util.rest.ResponseUtil.createFailureResponse(1, mediaType, "/certificates/generate", e.getMessage());
        }

    }



    /**
     * Get  /securities/:id : delete the "id" security.
     *
     * @param certificateName the name (alias) of the certificate to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @GetMapping(path = "/certificates/delete/{certificateName}", produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> deleteCertificate(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,  @RequestHeader String keystoreName, @RequestHeader String keystorePassword, @PathVariable String certificateName) throws Exception {
        log.debug("REST request to delete certificate : {}", certificateName);

        try {
            deleteCertificateInKeystore(keystoreName, keystorePassword, certificateName);
            return org.assimbly.util.rest.ResponseUtil.createSuccessResponse(1, "text/plain", "/certificates/{certificateName}", "success");
        }catch (Exception e) {
            log.debug("Remove url to Whitelist failed: ", e.getMessage());
            return org.assimbly.util.rest.ResponseUtil.createFailureResponse(1, "text/plain", "/certificates/{certificateName}", e.getMessage());
        }
    }


    /**
     * Remote  /securities/:id : delete the "url" security.
     *
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/certificates/update")
    public ResponseEntity<String> updateCertificates(@RequestBody String certificates, @RequestHeader String keystoreName, @RequestHeader String keystorePassword, @RequestParam String url) throws Exception {
        log.debug("REST request to updates certificates in truststore for url ", url);

        if(certificates.isEmpty()) {
            return ResponseEntity.ok().body("no certificates found");
        }

        JSONObject jsonObject = new JSONObject(certificates);

        JSONArray jsonArray = jsonObject.getJSONArray("certificate");

        Instant dateNow = Instant.now();

        for (int i = 0 ; i < jsonArray.length(); i++) {
            JSONObject certificate = jsonArray.getJSONObject(i);
            String certificateName = certificate.getString("certificateName");
            String certificateFile = certificate.getString("certificateFile");
            Instant certificateExpiry = Instant.parse(certificate.getString("certificateExpiry"));

            if(dateNow.isAfter(certificateExpiry)) {
                log.warn("Certificate '" + certificateName + "' for url " + url  + " is expired (Expiry Date: " + certificateExpiry + ")");
            }else {
                log.info("Certificate '" + certificateName + "' for url " + url + " is valid (Expiry Date: " + certificateExpiry + ")");
            }

            CertificatesUtil util = new CertificatesUtil();
            X509Certificate real = util.convertPemToX509Certificate(certificateFile);
            importCertificateInKeystore(keystoreName, keystorePassword, certificateName,real);
        }

        return ResponseEntity.ok().body("truststore updated");
    }



    private String certificatesAsJSon(Map<String,Certificate> certificateMap, String certificateUrl, String certificateStore) throws CertificateException {

        JSONObject certificatesObject  = new JSONObject();
        JSONObject certificateObject = new JSONObject();


        for (Map.Entry<String, Certificate> entry : certificateMap.entrySet()) {
            String key = entry.getKey();
            Certificate certificate = entry.getValue();
            X509Certificate real = (X509Certificate) certificate;

            String certificateName = key;
            Instant certificateExpiry = real.getNotAfter().toInstant();

            CertificatesUtil util = new CertificatesUtil();
            String certificateFile = util.convertX509CertificateToPem(real);

            JSONObject certificateDetails = new JSONObject();

            certificateDetails.put("certificateFile",certificateFile);
            certificateDetails.put("certificateName",certificateName);
            certificateDetails.put("certificateStore",certificateStore);

            certificateDetails.put("certificateExpiry",certificateExpiry);
            certificateDetails.put("certificateUrl",certificateUrl);

            certificateObject.append("certificate", certificateDetails);
        }

        certificatesObject.put("certificates",certificateObject);

        return certificatesObject.toString();

    }

    //Moved from connectorimpl

    public Certificate[] getCertificates(String url) {
        try {
            CertificatesUtil util = new CertificatesUtil();
            Certificate[] certificates = util.downloadCertificates(url);
            return certificates;
        } catch (Exception e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        }
        return null;
    }

    public Certificate getCertificateFromKeystore(String keystoreName, String keystorePassword, String certificateName) {
        String keystorePath = baseDir + "/security/" + keystoreName;
        CertificatesUtil util = new CertificatesUtil();
        return util.getCertificate(keystorePath, keystorePassword, certificateName);
    }

    public void setCertificatesInKeystore(String keystoreName, String keystorePassword, String url) {

        try {
            CertificatesUtil util = new CertificatesUtil();
            Certificate[] certificates = util.downloadCertificates(url);
            String keystorePath = baseDir + "/security/" + keystoreName;
            util.importCertificates(keystorePath, keystorePassword, certificates);
        } catch (Exception e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        }
    }

    public String importCertificateInKeystore(String keystoreName, String keystorePassword, String certificateName, Certificate certificate) {

        CertificatesUtil util = new CertificatesUtil();

        String keystorePath = baseDir + "/security/" + keystoreName;

        System.out.println("keystorePath=" + keystorePath);

        return  util.importCertificate(keystorePath, keystorePassword, certificateName, certificate);

    }


    public Map<String,Certificate> importCertificatesInKeystore(String keystoreName, String keystorePassword, Certificate[] certificates) throws Exception {

        CertificatesUtil util = new CertificatesUtil();

        String keystorePath = baseDir + "/security/" + keystoreName;

        return util.importCertificates(keystorePath, keystorePassword, certificates);

    }

    public Map<String,Certificate> importP12CertificateInKeystore(String keystoreName, String keystorePassword, String p12Certificate, String p12Password) throws Exception {

        CertificatesUtil util = new CertificatesUtil();

        String keystorePath = baseDir + "/security/" + keystoreName;
        return util.importP12Certificate(keystorePath, keystorePassword, p12Certificate, p12Password);

    }

    public void deleteCertificateInKeystore(String keystoreName, String keystorePassword, String certificateName) {

        String keystorePath = baseDir + "/security/" + keystoreName;

        CertificatesUtil util = new CertificatesUtil();
        util.deleteCertificate(keystorePath, keystorePassword, certificateName);
    }

}
