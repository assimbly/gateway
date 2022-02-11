import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { SecurityService } from './security.service';
import { ISecurity } from 'app/shared/model/security.model';
import { SecurityPopupService } from 'app/entities/security/security-popup.service';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import moment from 'moment';

@Component({
  selector: 'jhi-security-self-sign-dialog',
  templateUrl: './security-self-sign-dialog.component.html',
})
export class SecuritySelfSignDialogComponent implements OnInit, AfterContentInit {
  security: ISecurity;
  securityId: number;
  securities: Array<ISecurity> = [];

  importForm: FormGroup;

  cn: string;
  error = false;
  errorMessage: String;
  isSaving: boolean;

  constructor(private eventManager: JhiEventManager, private securityService: SecurityService, public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.importForm = new FormGroup({
      cn: new FormControl({ value: '' }),
      certificateStore: new FormControl({ value: 'keystore' }),
    });

    this.importForm.patchValue({
      cn: '',
      certificateStore: 'keystore',
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

  generateCertificate() {
    this.isSaving = true;
    const certificateStore = <FormGroup>this.importForm.controls['certificateStore'].value;

    this.securityService.generateCertificate(certificateStore + '.jks', this.cn).subscribe(
      data => {
        const json = JSON.parse(data.body);

        const certificate = json.certificates.certificate[0];

        this.security.certificateName = certificate.certificateName;

        console.log('this.security.certificateName=' + this.security.certificateName);

        this.security.certificateFile = certificate.certificateFile;
        this.security.certificateName = certificate.certificateName;
        this.security.certificateStore = certificate.certificateStore;
        this.security.certificateExpiry = moment(certificate.certificateExpiry, DATE_TIME_FORMAT);
        this.security.url = 'Self-Signed (' + this.cn + ')';

        this.securityService.create(this.security).subscribe(
          res => {
            this.error = false;
            this.activeModal.dismiss(true);
            this.eventManager.broadcast({ name: 'securityListModification', content: 'OK' });
          },
          err => {
            this.error = true;
            this.errorMessage = err.error;
            console.log(err);
          }
        );
      },
      err => {
        this.error = true;
        this.isSaving = false;

        this.errorMessage = err.error;
        console.log(err);
      }
    );
  }

  previousState() {
    window.history.back();
  }
}

@Component({
  selector: 'jhi-security-self-sign-popup',
  template: '',
})
export class SecuritySelfSignPopupComponent implements OnInit, OnDestroy {
  routeSub: any;

  constructor(protected route: ActivatedRoute, protected securityPopupService: SecurityPopupService) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(() => {
      this.securityPopupService.open(SecuritySelfSignDialogComponent as Component);
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
