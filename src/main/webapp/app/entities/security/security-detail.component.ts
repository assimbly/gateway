import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from './security.service';

import { ISecurity } from 'app/shared/model/security.model';

@Component({
    selector: 'jhi-security-detail',
    templateUrl: './security-detail.component.html'
})
export class SecurityDetailComponent implements OnInit {
    security: ISecurity;
    certificateDetails: Array<string> = [];
    certificatieType: String;
    SigningAlgorithm: String;
    IssuerDNPrincipal: String;
    SubjectDNPrincipal: String;

    constructor(protected activatedRoute: ActivatedRoute, protected securityService: SecurityService) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ security }) => {
            this.security = security;
        });
        this.securityService.getCertificateDetails(this.security.certificateName).subscribe(data => {
            this.certificateDetails = data.body.split(';');
            this.certificatieType = this.certificateDetails[0];
            this.SigningAlgorithm = this.certificateDetails[1];
            this.IssuerDNPrincipal = this.certificateDetails[2];
            this.SubjectDNPrincipal = this.certificateDetails[3];
        });
    }

    previousState() {
        window.history.back();
    }
}
