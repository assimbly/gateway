import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CertificateService } from './certificate.service';

import { ICertificate } from 'app/shared/model/certificate.model';

@Component({
    standalone: false,
    selector: 'jhi-certificate-detail',
    templateUrl: './certificate-detail.component.html'
})
export class CertificateDetailComponent implements OnInit {
    certificate: ICertificate;
    certificateDetails: Array<string> = [];
    certificatieType: String;
    SigningAlgorithm: String;
    IssuerDNPrincipal: String;
    SubjectDNPrincipal: String;

    constructor(protected activatedRoute: ActivatedRoute, protected certificateService: CertificateService) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ certificate }) => {
            this.certificate = certificate;
        });

        if (!this.certificate.url.startsWith('P12')) {
            this.certificateService.getCertificateDetails(this.certificate.certificateName).subscribe(data => {
                this.certificateDetails = data.body.split(';');
                this.certificatieType = this.certificateDetails[0];
                this.SigningAlgorithm = this.certificateDetails[1];
                this.IssuerDNPrincipal = this.certificateDetails[2];
                this.SubjectDNPrincipal = this.certificateDetails[3];
            });
        }
    }

    previousState() {
        window.history.back();
    }
}
