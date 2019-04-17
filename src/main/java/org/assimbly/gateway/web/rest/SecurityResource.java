package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.assimbly.connector.Connector;
import org.assimbly.gateway.domain.Security;
import org.assimbly.gateway.service.SecurityService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.web.rest.util.PaginationUtil;
import org.assimbly.gateway.service.dto.SecurityDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    @Timed
    public ResponseEntity<SecurityDTO[]> createSecurity(@RequestBody SecurityDTO securityDTO) throws Exception {
        log.debug("REST request to save Security : {}", securityDTO);
        
        if (securityDTO.getId() != null) {
            throw new BadRequestAlertException("A new security cannot already have an ID", ENTITY_NAME, "idexists");
        }
        
        Connector connector = connectorResource.getConnector();
        String url = securityDTO.getUrl();
        Certificate[] certificates = connector.getCertificates(url);
        Map<String,Certificate> certificateMap = connector.importCertificates(certificates);
        
        SecurityDTO[] result = new SecurityDTO[certificates.length];
        int index = 0;
        
        for (Map.Entry<String, Certificate> entry : certificateMap.entrySet()) {
            String key = entry.getKey();
            Certificate certificate = entry.getValue();
            X509Certificate real = (X509Certificate) certificate;

            String certificateName = key;
            Instant certificateExpiry = real.getNotAfter().toInstant();

            securityDTO.setCertificateName(certificateName);
            securityDTO.setCertificateExpiry(certificateExpiry);
            SecurityDTO saved = securityService.save(securityDTO);
            result[index] = saved;
            index++;
        }
                
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, "Added " + url + "to TLS whitelist"))
                .body(result);
        
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
    @Timed
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
    @Timed
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
    @Timed
    public ResponseEntity<SecurityDTO> getSecurity(@PathVariable Long id){
        log.debug("REST request to get Security : {}", id);        
        Optional<SecurityDTO> securityDTO = securityService.findOne(id);
        return ResponseUtil.wrapOrNotFound(securityDTO);
    }
    
    @GetMapping("/securities/details/{certificateName}")
    @Timed
    public ResponseEntity<String> getSecurityDetails(@PathVariable String certificateName) throws Exception{

        log.debug("REST request to get certificate details for certificate: " + certificateName);        

    	Connector connector = connectorResource.getConnector();
        
        if (certificateName == null) {
            throw new BadRequestAlertException("Certificatename cannot be found", ENTITY_NAME, "unknown certificatename");
        }
        
        Certificate certificate = connector.getCertificate(certificateName);
        X509Certificate real = (X509Certificate) certificate;
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
    @Timed
    public ResponseEntity<Void> deleteSecurity(@PathVariable Long id) throws Exception {
        log.debug("REST request to delete Security : {}", id);
        Connector connector = connectorResource.getConnector();
        Optional<SecurityDTO> securityDTO = securityService.findOne(id);
        String certificateName = securityDTO.get().getCertificateName();
        
        if (certificateName == null) {
            throw new BadRequestAlertException("Certificatename cannot be found", ENTITY_NAME, "unknown certificatename");
        }
        
        connector.deleteCertificates(certificateName);
        securityService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    
    /**
     * DELETE  /securities/:id : delete the "id" security.
     *
     * @param id the id of the securityDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping("/securities/remove")
    @Timed
    public ResponseEntity<Void> removeSecurity(@RequestBody String url) throws Exception {
        log.debug("REST request to remove certificates for url ", url);
        Connector connector = connectorResource.getConnector();
        List<Security> certificates = securityService.findAllByUrl(url);
        	
        for (Security certificate : certificates) {
        	String certificateName = certificate.getCertificateName();
        	connector.deleteCertificates(certificateName);
        	securityService.delete(certificate.getId());
        }
        
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, "delete")).build();
    }
    
    
    @GetMapping("/securities/isexpired/{withinNumberOfDays}")
    @Timed
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
    
}
