package org.assimbly.gateway.web.rest.gateway;

import org.assimbly.gateway.domain.Security;
import org.assimbly.gateway.service.SecurityService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.SecurityDTO;

import org.assimbly.util.CertificatesUtil;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import javax.annotation.PostConstruct;

import static org.assimbly.util.CertificatesUtil.convertPemToX509Certificate;


/**
 * REST controller for managing Security.
 */
@RestController
@RequestMapping("/api")
public class SecurityResource {

    private final Logger log = LoggerFactory.getLogger(SecurityResource.class);

    private static final String ENTITY_NAME = "security";

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
    public ResponseEntity<SecurityDTO> createSecurity(@RequestBody SecurityDTO securityDTO) throws Exception {
        log.debug("REST request to save Security : {}", securityDTO);

        if (securityDTO.getId() != null) {
            throw new BadRequestAlertException("A new security cannot already have an ID", ENTITY_NAME, "idexists");
        }

        try {
            SecurityDTO saved = securityService.save(securityDTO);

	        return ResponseEntity.ok()
	                .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, "Added securityDTO"))
	                .body(saved);

        } catch (Exception e) {
            log.debug("Add securityDTO failed: ", e.getMessage());
            throw new BadRequestAlertException("Adding securityDTO failed. (See error log) ", ENTITY_NAME, e.getMessage());
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
     * Remote  /securities/all : get all securities
     *
     * @return the ResponseEntity with status 200 (OK)
     */
    @GetMapping("/securities/all")
    public ResponseEntity<String> getAllSecurities() throws Exception {
        log.debug("REST request to get all certificates");

        List<Security> certificates = securityService.findAll();

        if(certificates.size()==0) {
            return ResponseEntity.ok().body("no certificates found");
        }

        String result = certificatesAsJSon2(certificates);

        return ResponseEntity.ok().body(result);
    }


    /**
     * Remote /certificates/byurl:url : delete the "url" security.
     *
     * @param url the url to get the certificates
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/securities/byurl")
    public ResponseEntity<String> getSecuritiesByUrl(@RequestBody String url) throws Exception {

        log.debug("REST request to get all securities by url ", url);

        List<Security> certificates = securityService.findAllByUrl(url);

        String result = certificatesAsJSon2(certificates);

        return ResponseEntity.ok().body(result);
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

        CertificatesUtil util = new CertificatesUtil();

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
        Optional<SecurityDTO> securityDTO = securityService.findOne(id);
        String certificateName = securityDTO.get().getCertificateName();

        if (certificateName == null) {
            throw new BadRequestAlertException("Certificatename cannot be found", ENTITY_NAME, "unknown certificatename");
        }

        try {
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
     * @param url the url of the securityDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/securities/remove")
    public ResponseEntity<Void> removeByUrl(@RequestBody String url) throws Exception {
        log.debug("REST request to remove certificates in truststore for url ", url);
        List<Security> certificates = securityService.findAllByUrl(url);

        for (Security certificate : certificates) {
            securityService.delete(certificate.getId());
        }

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, "delete")).build();
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

    private String certificatesAsJSon2(List<Security> securities) throws CertificateException {

        JSONObject certificatesObject  = new JSONObject();
        JSONObject certificateObject = new JSONObject();

        for (Security security : securities) {

            String certificateName = security.getCertificateName();
            String certificateUrl = security.getUrl();
            String certificateFile  = security.getCertificateFile();

            CertificatesUtil util = new CertificatesUtil();
            X509Certificate real = convertPemToX509Certificate(security.getCertificateFile());

            Instant certificateExpiry = real.getNotAfter().toInstant();

            JSONObject certificateDetails = new JSONObject();

            certificateDetails.put("certificateFile",certificateFile);
            certificateDetails.put("certificateName",certificateName);
            certificateDetails.put("certificateExpiry",certificateExpiry);
            certificateDetails.put("certificateUrl",certificateUrl);

            certificateObject.append("certificate", certificateDetails);
        }

        certificatesObject.put("certificates",certificateObject);

        return certificatesObject.toString();

    }

    //old: used for sync database with keystores
    // This methode Should be moved to "web.rest/integration"
    /*
    @PostConstruct
    private void init() throws Exception {

    	log.debug("REST request to sync all certificates with truststore");
        Integration integration = integrationResource.getIntegration();
        List<Security> certificates = securityService.findAll();

        if(certificates.size()>0) {
        	for (Security certificate : certificates) {

            	String certificateName = certificate.getCertificateName();
            	String certificateFile = certificate.getCertificateFile();
            	String certificateStore = certificate.getCertificateStore();

            	if(!certificateName.startsWith("P12")){
                    X509Certificate real = convertPemToX509Certificate(certificateFile);
                    integration.importCertificateInKeystore(certificateStore,"supersecret",certificateName,real);
                }
            }
        }

    }*/

}
