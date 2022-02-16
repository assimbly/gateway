package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.CertificateService;
import org.assimbly.gateway.domain.Certificate;
import org.assimbly.gateway.repository.CertificateRepository;
import org.assimbly.gateway.service.dto.CertificateDTO;
import org.assimbly.gateway.service.mapper.CertificateMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Service Implementation for managing Certificate.
 */
@Service
@Transactional
public class CertificateServiceImpl implements CertificateService {

    private final Logger log = LoggerFactory.getLogger(CertificateServiceImpl.class);

    private final CertificateRepository certificateRepository;

    private final CertificateMapper certificateMapper;

    public CertificateServiceImpl(CertificateRepository certificateRepository, CertificateMapper certificateMapper) {
        this.certificateRepository = certificateRepository;
        this.certificateMapper = certificateMapper;
    }

    /**
     * Save a certificate.
     *
     * @param certificateDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public CertificateDTO save(CertificateDTO certificateDTO) {
        log.debug("Request to save Certificate : {}", certificateDTO);

        Certificate certificate = certificateMapper.toEntity(certificateDTO);
        certificate = certificateRepository.save(certificate);
        return certificateMapper.toDto(certificate);
    }

    /**
     * Get all the securities.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<CertificateDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Securities");
        return certificateRepository.findAll(pageable)
            .map(certificateMapper::toDto);
    }


    /**
     * Get one certificate by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<CertificateDTO> findOne(Long id) {
        log.debug("Request to get Certificate : {}", id);
        return certificateRepository.findById(id)
            .map(certificateMapper::toDto);
    }

    /**
     * Delete the certificate by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Certificate : {}", id);
        certificateRepository.deleteById(id);
    }
    
    public List<Certificate> findAll() {
		return certificateRepository.findAll();
	}

    public List<Certificate> findAllByUrl(String url) {
		return certificateRepository.findAllByUrl(url);
	}

    public List<Certificate> findAllByCertificateExpiryBetween(Instant dateNow, Instant dateOfExpiry) {
		return certificateRepository.findAllByCertificateExpiryBetween(dateNow, dateOfExpiry);
	}
    
    public Optional<Certificate> findByCertificateName(String certificateName) {
		return certificateRepository.findByCertificateName(certificateName);
	}
    
}
