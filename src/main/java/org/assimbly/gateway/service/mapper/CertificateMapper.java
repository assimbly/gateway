package org.assimbly.gateway.service.mapper;

import org.assimbly.gateway.domain.*;
import org.assimbly.gateway.service.dto.CertificateDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Certificate and its DTO CertificateDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface CertificateMapper extends EntityMapper<CertificateDTO, org.assimbly.gateway.domain.Certificate> {

    default Certificate fromId(Long id) {
        if (id == null) {
            return null;
        }
        org.assimbly.gateway.domain.Certificate certificate = new org.assimbly.gateway.domain.Certificate();
        certificate.setId(id);
        return certificate;
    }
}