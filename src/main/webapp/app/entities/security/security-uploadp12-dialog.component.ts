import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { SecurityService } from './security.service';
import { ISecurity } from 'app/shared/model/security.model';
import { SecurityPopupService } from 'app/entities/security';

@Component({
    selector: 'jhi-security-uploadp12-dialog',
    templateUrl: './security-uploadp12-dialog.component.html'
})
export class SecurityUploadP12DialogComponent implements OnInit, AfterContentInit {
    securityId: number;
    securities: Array<ISecurity> = [];

    importForm: FormGroup;
    certificateFile: any;
    fileName = 'Choose file';
    fileType: string;
    password2: string;
    uploadError = false;
    uploadErrorMessage: String;

    constructor(private eventManager: JhiEventManager, private securityService: SecurityService, public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.importForm = new FormGroup({
            password: new FormControl({ value: '' })
        });
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
        reader.readAsDataURL(event.target.files[0]);

        this.fileName = event.target.files[0].name;
        this.fileType = this.fileName.substring(this.fileName.lastIndexOf('.') + 1);
    }

    uploadP12Certificate() {
        let password = <FormGroup>this.importForm.controls['password'].value;

        this.securityService.uploadP12Certificate(this.certificateFile, this.fileType, password).subscribe(
            data => {
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
export class SecurityUploadP12PopupComponent implements OnInit, OnDestroy {
    routeSub: any;

    constructor(protected route: ActivatedRoute, protected securityPopupService: SecurityPopupService) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(() => {
            this.securityPopupService.open(SecurityUploadP12DialogComponent as Component);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
