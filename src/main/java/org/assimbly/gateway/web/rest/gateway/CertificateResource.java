package org.assimbly.gateway.web.rest.gateway;

import org.assimbly.gateway.domain.Certificate;
import org.assimbly.gateway.service.CertificateService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.CertificateDTO;

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
 * REST controller for managing Certifcate.
 */
@RestController
@RequestMapping("/api")
public class CertificateResource {

    private final Logger log = LoggerFactory.getLogger(CertificateResource.class);

    private static final String ENTITY_NAME = "certificate";

    private final CertificateService certificateService;

    public CertificateResource(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    /**
     * POST  /certificates : Create a new certificate.
     *
     * @param certificateDTO the certificateDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new certificateDTO, or with status 400 (Bad Request) if the certificate has already an ID
     * @throws Exception
     */
    @PostMapping("/certificates")
    public ResponseEntity<CertificateDTO> createCertificate(@RequestBody CertificateDTO certificateDTO) throws Exception {
        log.debug("REST request to save Certificate : {}", certificateDTO);

        if (certificateDTO.getId() != null) {
            throw new BadRequestAlertException("A new certificate cannot already have an ID", ENTITY_NAME, "idexists");
        }

        try {
            CertificateDTO saved = certificateService.save(certificateDTO);

	        return ResponseEntity.ok()
	                .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, "Added certificateDTO"))
	                .body(saved);

        } catch (Exception e) {
            log.debug("Add certificateDTO failed: ", e.getMessage());
            throw new BadRequestAlertException("Adding certificateDTO failed. (See error log) ", ENTITY_NAME, e.getMessage());
   		}

    }

    /**
     * PUT  /certificates : Updates an existing certificate.
     *
     * @param certificateDTO the certificateDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated certificateDTO,
     * or with status 400 (Bad Request) if the certificateDTO is not valid,
     * or with status 500 (Internal Server Error) if the certificateDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/certificates")
    public ResponseEntity<CertificateDTO> updateCertificate(@RequestBody CertificateDTO certificateDTO) throws URISyntaxException {
        log.debug("REST request to update Certificate : {}", certificateDTO);
        if (certificateDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        CertificateDTO result = certificateService.save(certificateDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, certificateDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /certificates : get all the certificates.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of certificates in body
     */
    @GetMapping("/certificates")
    public ResponseEntity<List<CertificateDTO>> getAllCertificates(Pageable pageable) {
        log.debug("REST request to get a page of Certificates");
        Page<CertificateDTO> page = certificateService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/certificates");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * Remote  /certificates/all : get all certificates
     *
     * @return the ResponseEntity with status 200 (OK)
     */
    @GetMapping("/certificates/all")
    public ResponseEntity<String> getAllCertificates() throws Exception {
        log.debug("REST request to get all certificates");

        List<Certificate> certificates = certificateService.findAll();

        if(certificates.size()==0) {
            return ResponseEntity.ok().body("no certificates found");
        }

        String result = certificatesAsJSon2(certificates);

        return ResponseEntity.ok().body(result);
    }


    /**
     * Remote /certificates/byurl:url : delete the "url" certificate.
     *
     * @param url the url to get the certificates
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/certificates/byurl")
    public ResponseEntity<String> getCertificatesByUrl(@RequestBody String url) throws Exception {

        log.debug("REST request to get all certificates by url ", url);

        List<Certificate> certificates = certificateService.findAllByUrl(url);

        String result = certificatesAsJSon2(certificates);

        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /certificates/:id : get the "id" certificate.
     *
     * @param id the id of the certificateDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the certificateDTO, or with status 404 (Not Found)
     */
    @GetMapping("/certificates/{id}")
    public ResponseEntity<CertificateDTO> getCertificate(@PathVariable Long id){
        log.debug("REST request to get Certificate : {}", id);
        Optional<CertificateDTO> certificateDTO = certificateService.findOne(id);
        return ResponseEntity.ok().body(certificateDTO.get());
    }

    @GetMapping("/certificates/details/{certificateName}")
    public ResponseEntity<String> getCertificateDetails(@PathVariable String certificateName) throws Exception{

        log.debug("REST request to get certificate details for certificate: " + certificateName);

        if (certificateName == null) {
            throw new BadRequestAlertException("Certificatename cannot be found", ENTITY_NAME, "unknown certificatename");
        }

        Optional<Certificate> certificate = certificateService.findByCertificateName(certificateName);
        String certificateFile = certificate.get().getCertificateFile();

        X509Certificate real = convertPemToX509Certificate(certificateFile);

        String certificateString = "Type=" + real.getType() + ";Signing Algorithm=" + real.getSigAlgName() + ";IssuerDN Principal=" + real.getIssuerX500Principal() + ";SubjectDN Principal=" + real.getSubjectX500Principal();

        return ResponseEntity.ok().body(certificateString);

    }

    /**
     * DELETE  /certificates/:id : delete the "id" certificate.
     *
     * @param id the id of the certificateDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable Long id) throws Exception {
        log.debug("REST request to delete Certificate : {}", id);
        Optional<CertificateDTO> certificateDTO = certificateService.findOne(id);
        String certificateName = certificateDTO.get().getCertificateName();

        if (certificateName == null) {
            throw new BadRequestAlertException("Certificatename cannot be found", ENTITY_NAME, "unknown certificatename");
        }

        try {
	        certificateService.delete(id);
	        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
        }catch (Exception e) {
            log.debug("Remove url to Whitelist failed: ", e.getMessage());
            throw new BadRequestAlertException("Remove url to whitelist failed. (See error log) ", ENTITY_NAME, e.getMessage());
   		}
    }

    /**
     * Remote  /certificates/:id : delete the "url" certificate.
     *
     * @param url the url of the certificateDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/certificates/remove")
    public ResponseEntity<Void> removeByUrl(@RequestBody String url) throws Exception {
        log.debug("REST request to remove certificates in truststore for url ", url);
        List<Certificate> certificates = certificateService.findAllByUrl(url);

        for (Certificate certificate : certificates) {
            certificateService.delete(certificate.getId());
        }

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, "delete")).build();
    }

    @GetMapping("/certificates/isexpired/{withinNumberOfDays}")
    public ResponseEntity<Boolean> isExpired(@PathVariable int withinNumberOfDays) throws Exception{

        log.debug("REST request returns if a certificate will expire with the given days: " + withinNumberOfDays);

        Boolean isExpired;
        Instant dateNow = Instant.now();
        Instant dateOfExpiry = Instant.now().plusSeconds(withinNumberOfDays * 86400);

        List<Certificate> listExpired = certificateService.findAllByCertificateExpiryBetween(dateNow, dateOfExpiry);

        if(listExpired.size()>0) {
        	isExpired = true;
        }else {
        	isExpired = false;
        }

        return ResponseEntity.ok().body(isExpired);

    }

    private String certificatesAsJSon2(List<Certificate> certificates) throws CertificateException {

        JSONObject certificatesObject  = new JSONObject();
        JSONObject certificateObject = new JSONObject();

        for (Certificate certificate : certificates) {

            String certificateName = certificate.getCertificateName();
            String certificateUrl = certificate.getUrl();
            String certificateFile  = certificate.getCertificateFile();

            CertificatesUtil util = new CertificatesUtil();
            X509Certificate real = convertPemToX509Certificate(certificate.getCertificateFile());

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
        List<Certificate> certificates = certificateService.findAll();

        if(certificates.size()>0) {
        	for (Certificate certificate : certificates) {

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
