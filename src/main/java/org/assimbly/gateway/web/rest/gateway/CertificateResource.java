package org.assimbly.gateway.web.rest.gateway;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.assimbly.gateway.domain.Certificate;
import org.assimbly.gateway.service.CertificateService;
import org.assimbly.gateway.service.dto.CertificateDTO;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import static org.assimbly.util.CertificatesUtil.convertPemToX509Certificate;


/**
 * REST controller for managing Certifcate.
 */
@Tag(name = "Certificate resources", description = "Manage the certificate records of the gateway")
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
     * POST  /certificate-resources : Create a new certificate.
     *
     * @param certificateDTO the certificateDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new certificateDTO, or with status 400 (Bad Request) if the certificate has already an ID
     * @throws Exception
     */
    @Operation(summary = "Create a certificate")
    @PostMapping("/certificate-resources")
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
            throw new BadRequestAlertException("Adding certificateDTO failed. (See error log) ", ENTITY_NAME, e.getMessage());
   		}

    }

    /**
     * PUT  /certificate-resources : Updates an existing certificate.
     *
     * @param certificateDTO the certificateDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated certificateDTO,
     * or with status 400 (Bad Request) if the certificateDTO is not valid,
     * or with status 500 (Internal Server Error) if the certificateDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @Operation(summary = "Update a certificate")
    @PutMapping("/certificate-resources")
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
     * GET  /certificate-resources : get all the certificates.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of certificates in body
     */
    @Operation(summary = "List certificates (paged)")
    @GetMapping("/certificate-resources")
    public ResponseEntity<List<CertificateDTO>> getAllCertificates(Pageable pageable) {
        log.debug("REST request to get a page of Certificates");
        Page<CertificateDTO> page = certificateService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/certificate-resources");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * Remote  /certificate-resources/all : get all certificates
     *
     * @return the ResponseEntity with status 200 (OK)
     */
    @Operation(summary = "List all certificates")
    @GetMapping("/certificate-resources/all")
    public ResponseEntity<String> getAllCertificates() throws Exception {
        log.debug("REST request to get all certificates");

        List<Certificate> certificates = certificateService.findAll();

        if(certificates.isEmpty()) {
            return ResponseEntity.ok().body("no certificates found");
        }

        String result = certificatesAsJSon2(certificates);

        return ResponseEntity.ok().body(result);
    }


    /**
     * Remote /certificate-resources/byurl:url : delete the "url" certificate.
     *
     * @param url the url to get the certificates
     * @return the ResponseEntity with status 200 (OK)
     */
    @Operation(summary = "Get the certificates of a URL")
    @PostMapping("/certificate-resources/byurl")
    public ResponseEntity<String> getCertificatesByUrl(@RequestBody String url) throws Exception {

        log.debug("REST request to get all certificates by url {}", url);

        List<Certificate> certificates = certificateService.findAllByUrl(url);

        String result = certificatesAsJSon2(certificates);

        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /certificate-resources/:id : get the "id" certificate.
     *
     * @param id the id of the certificateDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the certificateDTO, or with status 404 (Not Found)
     */
    @Operation(summary = "Get a certificate")
    @GetMapping("/certificate-resources/{id}")
    public ResponseEntity<CertificateDTO> getCertificate(@PathVariable(value = "id") Long id){
        log.debug("REST request to get Certificate : {}", id);
        Optional<CertificateDTO> certificateDTO = certificateService.findOne(id);
        return ResponseEntity.of(certificateDTO);
    }

    @Operation(summary = "Get the details of a certificate")
    @GetMapping("/certificate-resources/details/{certificateName}")
    public ResponseEntity<String> getCertificateDetails(@PathVariable(value = "certificateName") String certificateName) throws Exception{

        log.debug("REST request to get certificate details for certificate: " + certificateName);

        if (certificateName == null) {
            throw new BadRequestAlertException("Certificatename cannot be found", ENTITY_NAME, "unknown certificatename");
        }

        Optional<Certificate> certificate = certificateService.findByCertificateName(certificateName);
        if (certificate.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        X509Certificate real = convertPemToX509Certificate(certificate.get().getCertificateFile());
        if (real == null) {
            return ResponseEntity.notFound().build();
        }

        String certificateString = "Type=" + real.getType() + ";Signing Algorithm=" + real.getSigAlgName() + ";IssuerDN Principal=" + real.getIssuerX500Principal() + ";SubjectDN Principal=" + real.getSubjectX500Principal();

        return ResponseEntity.ok().body(certificateString);

    }

    /**
     * DELETE  /certificate-resources/:id : delete the "id" certificate.
     *
     * @param id the id of the certificateDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @Operation(summary = "Delete a certificate")
    @DeleteMapping("/certificate-resources/{id}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable("id") Long id) throws Exception {
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
            throw new BadRequestAlertException("Remove url to whitelist failed. (See error log) ", ENTITY_NAME, e.getMessage());
   		}
    }

    /**
     * Remote  /certificate-resources/:id : delete the "url" certificate.
     *
     * @param url the url of the certificateDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @Operation(summary = "Remove the certificates of a URL")
    @PostMapping("/certificate-resources/remove")
    public ResponseEntity<Void> removeByUrl(@RequestBody String url) {
        log.debug("REST request to remove certificates in truststore for url {}", url);
        List<Certificate> certificates = certificateService.findAllByUrl(url);

        for (Certificate certificate : certificates) {
            certificateService.delete(certificate.getId());
        }

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, "delete")).build();
    }

    private String certificatesAsJSon2(List<Certificate> certificates) throws CertificateException {

        JSONObject certificatesObject  = new JSONObject();
        JSONObject certificateObject = new JSONObject();

        for (Certificate certificate : certificates) {

            String certificateName = certificate.getCertificateName();
            String certificateUrl = certificate.getUrl();
            String certificateFile  = certificate.getCertificateFile();

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

}
