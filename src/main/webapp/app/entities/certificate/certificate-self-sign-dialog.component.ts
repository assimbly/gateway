import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { CertificateService } from './certificate.service';
import { ICertificate } from 'app/shared/model/certificate.model';
import { CertificatePopupService } from 'app/entities/certificate/certificate-popup.service';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import dayjs from 'dayjs/esm';

@Component({
  selector: 'jhi-certificate-self-sign-dialog',
  templateUrl: './certificate-self-sign-dialog.component.html',
})
export class CertificateSelfSignDialogComponent implements OnInit, AfterContentInit {
  certificate: ICertificate;
  certificateId: number;
  securities: Array<ICertificate> = [];

  importForm: FormGroup;

  cn: string;
  error = false;
  errorMessage: String;
  isSaving: boolean;

  constructor(private eventManager: EventManager, private certificateService: CertificateService, public activeModal: NgbActiveModal) {}

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
    this.certificateService.query().subscribe(res => {
      this.securities = res.body;
      this.certificateId = this.securities[0].id;
    });
  }

  clear() {
    this.activeModal.dismiss('cancel');
  }

  generateCertificate() {
    this.isSaving = true;
    const certificateStore = <FormGroup>this.importForm.controls['certificateStore'].value;

    this.certificateService.generateCertificate(certificateStore + '.jks', this.cn).subscribe(
      data => {
        const json = JSON.parse(data.body);

        const certificate = json.certificates.certificate[0];

        this.certificate.certificateName = certificate.certificateName;

        console.log('this.certificate.certificateName=' + this.certificate.certificateName);

        this.certificate.certificateFile = certificate.certificateFile;
        this.certificate.certificateName = certificate.certificateName;
        this.certificate.certificateStore = certificate.certificateStore;
        this.certificate.certificateExpiry = dayjs(certificate.certificateExpiry, DATE_TIME_FORMAT);
        this.certificate.url = 'Self-Signed (' + this.cn + ')';

        this.certificateService.create(this.certificate).subscribe(
          res => {
            this.error = false;
            this.activeModal.dismiss(true);
		    this.eventManager.broadcast(new EventWithContent('certificateListModification', 'OK'));
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
  selector: 'jhi-certificate-self-sign-popup',
  template: '',
})
export class CertificateSelfSignPopupComponent implements OnInit, OnDestroy {
  routeSub: any;

  constructor(protected route: ActivatedRoute, protected certificatePopupService: CertificatePopupService) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(() => {
      this.certificatePopupService.open(CertificateSelfSignDialogComponent as Component);
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
