package org.assimbly.gateway.service.impl;

import org.assimbly.gateway.service.SecurityService;
import org.assimbly.gateway.domain.Security;
import org.assimbly.gateway.repository.SecurityRepository;
import org.assimbly.gateway.service.dto.SecurityDTO;
import org.assimbly.gateway.service.mapper.SecurityTLSMapper;
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
 * Service Implementation for managing Security.
 */
@Service
@Transactional
public class SecurityServiceImpl implements SecurityService {

    private final Logger log = LoggerFactory.getLogger(SecurityServiceImpl.class);

    private final SecurityRepository securityRepository;

    private final SecurityTLSMapper securityMapper;

    public SecurityServiceImpl(SecurityRepository securityRepository, SecurityTLSMapper securityMapper) {
        this.securityRepository = securityRepository;
        this.securityMapper = securityMapper;
    }

    /**
     * Save a security.
     *
     * @param securityDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public SecurityDTO save(SecurityDTO securityDTO) {
        log.debug("Request to save Security : {}", securityDTO);

        Security security = securityMapper.toEntity(securityDTO);
        security = securityRepository.save(security);
        return securityMapper.toDto(security);
    }

    /**
     * Get all the securities.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<SecurityDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Securities");
        return securityRepository.findAll(pageable)
            .map(securityMapper::toDto);
    }


    /**
     * Get one security by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<SecurityDTO> findOne(Long id) {
        log.debug("Request to get Security : {}", id);
        return securityRepository.findById(id)
            .map(securityMapper::toDto);
    }

    /**
     * Delete the security by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Security : {}", id);
        securityRepository.deleteById(id);
    }

    
    public List<Security> findAllByCertificateExpiryBetween(Instant dateNow, Instant dateOfExpiry) {
		return securityRepository.findAllByCertificateExpiryBetween(dateNow, dateOfExpiry);
	}

    public List<Security> findAllByUrl(String url) {
		return securityRepository.findAllByUrl(url);
	}
    
}
