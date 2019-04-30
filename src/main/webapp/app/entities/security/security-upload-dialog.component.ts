import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { SecurityService } from './security.service';
import { ISecurity } from 'app/shared/model/security.model';
import { SecurityPopupService } from "app/entities/security";


@Component({
    selector: 'jhi-security-upload-dialog',
    templateUrl: './security-upload-dialog.component.html'
})
export class SecurityUploadDialogComponent implements AfterContentInit {

    securityId: number;
    securities: Array<ISecurity> = [];
    certificateFile: any;
    fileName = 'Choose file';
    uploadError = false;
    uploadErrorMessage: String;

    constructor(
        private eventManager: JhiEventManager,    
        private securityService: SecurityService,
        public activeModal: NgbActiveModal
    ) {
    }

    ngAfterContentInit() {
        this.securityService.query().subscribe(res => {
            this.securities = res.body;
            this.securityId = this.securities[0].id;
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    openFile(event) {
        const reader = new FileReader();
        reader.onload = () => {
            this.certificateFile = reader.result;
        };
        reader.readAsBinaryString(event.target.files[0]);
        this.fileName = event.target.files[0].name;
    }

    uploadCertificate() {
        this.securityService.uploadCertificate(this.certificateFile).subscribe((data) => {
                this.uploadError = false;
                this.activeModal.dismiss(true);
                this.eventManager.broadcast({ name: 'securityListModification', content: 'OK' });
            },
            err => {
                this.uploadError = true;
                this.uploadErrorMessage = err.error;
                console.log(err);
            }
        );
    }
}

@Component({
    selector: 'jhi-security-upload-popup',
    template: ''
})
export class SecurityUploadPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        protected route: ActivatedRoute,
        protected securityPopupService: SecurityPopupService
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(() => {
            this.securityPopupService
                .open(SecurityUploadDialogComponent as Component);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
