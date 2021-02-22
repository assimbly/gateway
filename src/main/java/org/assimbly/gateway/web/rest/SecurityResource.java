package org.assimbly.gateway.web.rest;

import org.assimbly.connector.Connector;
import org.assimbly.gateway.domain.Security;
import org.assimbly.gateway.service.SecurityService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.BrokerDTO;
import org.assimbly.gateway.service.dto.SecurityDTO;
import org.assimbly.gateway.web.rest.util.ResponseUtil;
import io.swagger.annotations.ApiParam;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.security.cert.Certificate;
import java.security.cert.CertificateEncodingException;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;


/**
 * REST controller for managing Security.
 */
@RestController
@RequestMapping("/api")
public class SecurityResource {

    private final Logger log = LoggerFactory.getLogger(SecurityResource.class);

    private static final String ENTITY_NAME = "security";

	@Autowired
	private ConnectorResource connectorResource;


    private final SecurityService securityService;

    public SecurityResource(SecurityService securityService) {
        this.securityService = securityService;
    }

    /**
     * POST  /securities : Create a new security.
     *
     * @param securityDTO the securityDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new securityDTO, or with status 400 (Bad Request) if the security has already an ID
     * @throws Exception
     */
    @PostMapping("/securities")
    public ResponseEntity<SecurityDTO[]> createSecurity(@RequestBody SecurityDTO securityDTO) throws Exception {
        log.debug("REST request to save Security : {}", securityDTO);

        if (securityDTO.getId() != null) {
            throw new BadRequestAlertException("A new security cannot already have an ID", ENTITY_NAME, "idexists");
        }

        try {
	        Connector connector = connectorResource.getConnector();
	        String url = securityDTO.getUrl();
	        Certificate[] certificates = connector.getCertificates(url);
	        Map<String,Certificate> certificateMap = connector.importCertificatesInTruststore(certificates);

	        SecurityDTO[] result = new SecurityDTO[certificates.length];
	        int index = 0;

	        for (Map.Entry<String, Certificate> entry : certificateMap.entrySet()) {
	            String key = entry.getKey();
	            Certificate certificate = entry.getValue();
	            X509Certificate real = (X509Certificate) certificate;

	            String certificateName = key;
	            Instant certificateExpiry = real.getNotAfter().toInstant();

	            String certificateFile = convertX509CertificateToPem(real);

	            securityDTO.setCertificateFile(certificateFile);
	            securityDTO.setCertificateName(certificateName);
	            securityDTO.setCertificateExpiry(certificateExpiry);
	            SecurityDTO saved = securityService.save(securityDTO);
	            result[index] = saved;

	            index++;
	        }

	        return ResponseEntity.ok()
	                .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, "Added " + url + " to TLS whitelist"))
	                .body(result);

        } catch (Exception e) {
            log.debug("Add url to Whitelist failed: ", e.getMessage());
            throw new BadRequestAlertException("Adding url to whitelist failed. (See error log) ", ENTITY_NAME, e.getMessage());
   		}

    }

    /**
     * PUT  /securities : Updates an existing security.
     *
     * @param securityDTO the securityDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated securityDTO,
     * or with status 400 (Bad Request) if the securityDTO is not valid,
     * or with status 500 (Internal Server Error) if the securityDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/securities")
    public ResponseEntity<SecurityDTO> updateSecurity(@RequestBody SecurityDTO securityDTO) throws URISyntaxException {
        log.debug("REST request to update Security : {}", securityDTO);
        if (securityDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        SecurityDTO result = securityService.save(securityDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, securityDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /securities : get all the securities.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of securities in body
     */
    @GetMapping("/securities")
    public ResponseEntity<List<SecurityDTO>> getAllSecurities(Pageable pageable) {
        log.debug("REST request to get a page of Securities");
        Page<SecurityDTO> page = securityService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/securities");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /securities/:id : get the "id" security.
     *
     * @param id the id of the securityDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the securityDTO, or with status 404 (Not Found)
     */
    @GetMapping("/securities/{id}")
    public ResponseEntity<SecurityDTO> getSecurity(@PathVariable Long id){
        log.debug("REST request to get Security : {}", id);
        Optional<SecurityDTO> securityDTO = securityService.findOne(id);
        return ResponseEntity.ok().body(securityDTO.get());
    }

    @GetMapping("/securities/details/{certificateName}")
    public ResponseEntity<String> getSecurityDetails(@PathVariable String certificateName) throws Exception{

        log.debug("REST request to get certificate details for certificate: " + certificateName);

        if (certificateName == null) {
            throw new BadRequestAlertException("Certificatename cannot be found", ENTITY_NAME, "unknown certificatename");
        }

        Optional<Security> security = securityService.findByCertificateName(certificateName);
        String certificateFile = security.get().getCertificateFile();
        X509Certificate real = convertPemToX509Certificate(certificateFile);

        String certificateString = "Type=" + real.getType() + ";Signing Algorithm=" + real.getSigAlgName() + ";IssuerDN Principal=" + real.getIssuerX500Principal() + ";SubjectDN Principal=" + real.getSubjectX500Principal();

        return ResponseEntity.ok().body(certificateString);

    }

    /**
     * DELETE  /securities/:id : delete the "id" security.
     *
     * @param id the id of the securityDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/securities/{id}")
    public ResponseEntity<Void> deleteSecurity(@PathVariable Long id) throws Exception {
        log.debug("REST request to delete Security : {}", id);
        Connector connector = connectorResource.getConnector();
        Optional<SecurityDTO> securityDTO = securityService.findOne(id);
        String certificateName = securityDTO.get().getCertificateName();

        if (certificateName == null) {
            throw new BadRequestAlertException("Certificatename cannot be found", ENTITY_NAME, "unknown certificatename");
        }

        try {
	        connector.deleteCertificatesInTruststore(certificateName);
	        securityService.delete(id);
	        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
        }catch (Exception e) {
            log.debug("Remove url to Whitelist failed: ", e.getMessage());
            throw new BadRequestAlertException("Remove url to whitelist failed. (See error log) ", ENTITY_NAME, e.getMessage());
   		}
    }


    /**
     * Remote  /securities/:id : delete the "url" security.
     *
     * @param id the id of the securityDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/securities/remove")
    public ResponseEntity<Void> removeSecurityInTruststore(@RequestBody String url) throws Exception {
        log.debug("REST request to remove certificates in truststore for url ", url);
        Connector connector = connectorResource.getConnector();
        List<Security> certificates = securityService.findAllByUrl(url);

        for (Security certificate : certificates) {
        	String certificateName = certificate.getCertificateName();
        	connector.deleteCertificatesInTruststore(certificateName);
        	securityService.delete(certificate.getId());
        }

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, "delete")).build();
    }


    /**
     * Remote  /securities/:id : delete the "url" security.
     *
     * @param id the id of the securityDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/securities/syncTrustore")
    public ResponseEntity<String> syncSecurityInTruststore() throws Exception {
        log.debug("REST request to sync all certificates with truststore");
        Connector connector = connectorResource.getConnector();
        List<Security> certificates = securityService.findAll();

        if(certificates.size()==0) {
            return ResponseEntity.ok().body("no certificates found");
        }

        for (Security certificate : certificates) {
        	String certificateName = certificate.getCertificateName();
        	String certificateFile = certificate.getCertificateFile();
        	X509Certificate real = convertPemToX509Certificate(certificateFile);
        	connector.importCertificateInTruststore(certificateName,real);
        }

        return ResponseEntity.ok().body("truststore synced");
    }

    /**
     * Remote  /securities/:id : delete the "url" security.
     *
     * @param id the id of the securityDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/securities/updateTrustore")
    public ResponseEntity<String> upateSecurityInTruststore(@RequestBody String url) throws Exception {
        log.debug("REST request to updates certificates in truststore for url ", url);
        Connector connector = connectorResource.getConnector();
        List<Security> certificates = securityService.findAllByUrl(url);

        if(certificates.size()==0) {
            return ResponseEntity.ok().body("no certificates found");
        }

        Instant dateNow = Instant.now();

        for (Security certificate : certificates) {
        	String certificateName = certificate.getCertificateName();
        	String certificateFile = certificate.getCertificateFile();
        	Instant certificateExpiry = certificate.getCertificateExpiry();

        	if(dateNow.isAfter(certificateExpiry)) {
        		log.warn("Certificate '" + certificateName + "' for url " + url  + " is expired (Expiry Date: " + certificateExpiry + ")");
        	}else {
        		log.info("Certificate '" + certificateName + "' for url " + url + " is valid (Expiry Date: " + certificateExpiry + ")");
        	}

        	X509Certificate real = convertPemToX509Certificate(certificateFile);
        	connector.importCertificateInTruststore(certificateName,real);
        }

        return ResponseEntity.ok().body("truststore updated");
    }

    @GetMapping("/securities/isexpired/{withinNumberOfDays}")
    public ResponseEntity<Boolean> isExpired(@PathVariable int withinNumberOfDays) throws Exception{

        log.debug("REST request returns if a certificate will expire with the given days: " + withinNumberOfDays);

        Boolean isExpired;
        Instant dateNow = Instant.now();
        Instant dateOfExpiry = Instant.now().plusSeconds(withinNumberOfDays * 86400);

        List<Security> listExpired = securityService.findAllByCertificateExpiryBetween(dateNow, dateOfExpiry);

        if(listExpired.size()>0) {
        	isExpired = true;
        }else {
        	isExpired = false;
        }

        return ResponseEntity.ok().body(isExpired);

    }

    @PostMapping(path = "/securities/uploadcertificate", consumes = {"text/plain"}, produces = {"text/plain","application/xml", "application/json"})
    public ResponseEntity<String> uploadCertificate(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType,@ApiParam(hidden = true) @RequestHeader("Content-Type") String contentType, @RequestHeader("FileType") String fileType, @RequestBody String certificate) throws Exception {

       	try {

            SecurityDTO securityDTO = new SecurityDTO();

       		//get connector
        	Connector connector = connectorResource.getConnector();

            Certificate cert;
            if(fileType.equalsIgnoreCase("pem")){
                cert = convertPemToX509Certificate(certificate);
            }else{
                //create certificate from String
                CertificateFactory cf = CertificateFactory.getInstance("X.509");
                InputStream certificateStream = new ByteArrayInputStream(certificate.getBytes());
                cert = cf.generateCertificate(certificateStream);
            }

            Certificate[] certificates = new X509Certificate[1];
            certificates[0] = cert;

            //import certificate into truststore
            Map<String,Certificate> certificateMap = connector.importCertificatesInTruststore(certificates);

            //save new entry to database
            for (Map.Entry<String, Certificate> entry : certificateMap.entrySet()) {
                String key = entry.getKey();
                Certificate certificateEntry = entry.getValue();
                X509Certificate real = (X509Certificate) certificateEntry;

                String certificateKey = key;
                Instant certificateExpiry = real.getNotAfter().toInstant();

                //Gets certificate Name
                String realCertificateName = real.getSubjectDN().getName();
                realCertificateName = realCertificateName.substring(realCertificateName.indexOf("CN=") + 3);
                realCertificateName = realCertificateName.substring(0, realCertificateName.indexOf(","));
	            String certificateFile = convertX509CertificateToPem(real);

                securityDTO.setUrl("Generic (" + realCertificateName + ")");
                securityDTO.setCertificateFile(certificateFile);
                securityDTO.setCertificateName(certificateKey);
                securityDTO.setCertificateExpiry(certificateExpiry);
                securityService.save(securityDTO);
                break;
            }

            log.debug("Uploaded certificate: " + cert);

   			return ResponseUtil.createSuccessResponse(1L, mediaType,"/securities/uploadcertificate","Certification File uploaded");
   		} catch (Exception e) {
            log.debug("Uploaded certificate failed: ", e.getMessage());
   			return ResponseUtil.createFailureResponse(1L, mediaType,"/securities/uploadcertificate",e.getMessage());
   		}

    }


    protected static String convertX509CertificateToPem(X509Certificate certificate) throws CertificateEncodingException {

    	 org.apache.commons.codec.binary.Base64 encoder = new org.apache.commons.codec.binary.Base64(64);
    	 byte[] derCertificate = certificate.getEncoded();
    	 String pemCertificate = new String(encoder.encode(derCertificate));

    	 return "-----BEGIN CERTIFICATE-----\n" + pemCertificate + "-----END CERTIFICATE-----";

    }

    public static X509Certificate convertPemToX509Certificate(String pemCertificate) throws CertificateException {

        org.apache.commons.codec.binary.Base64 decoder = new org.apache.commons.codec.binary.Base64(64);
        CertificateFactory cf = CertificateFactory.getInstance("X509");
    	X509Certificate certificate = null;

        try {
            if (pemCertificate != null && !pemCertificate.trim().isEmpty()) {

                Pattern parse = Pattern.compile("(?m)(?s)^---*BEGIN.*---*$(.*)^---*END.*---*$.*");
                pemCertificate = parse.matcher(pemCertificate).replaceFirst("$1");

                byte[] derCertificate = decoder.decode(pemCertificate);

                certificate = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(derCertificate));

            }
        } catch (CertificateException e) {
            throw new CertificateException(e);
        }
        return certificate;
    }

    @PostConstruct
    private void init() throws Exception {

    	log.debug("REST request to sync all certificates with truststore");
        Connector connector = connectorResource.getConnector();
        List<Security> certificates = securityService.findAll();

        if(certificates.size()>0) {
        	for (Security certificate : certificates) {
            	String certificateName = certificate.getCertificateName();
            	String certificateFile = certificate.getCertificateFile();
            	X509Certificate real = convertPemToX509Certificate(certificateFile);
            	connector.importCertificateInTruststore(certificateName,real);
            }
        }

    }


}
