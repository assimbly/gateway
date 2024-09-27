import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { CertificateService } from './certificate.service';
import { ICertificate } from 'app/shared/model/certificate.model';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import dayjs from 'dayjs/esm';

@Component({
  selector: 'jhi-certificate-self-sign-dialog',
  templateUrl: './certificate-self-sign-dialog.component.html',
})
export class CertificateSelfSignDialogComponent implements OnInit {
  certificate: ICertificate;
  certificateId: number;
  certificates: Array<ICertificate> = [];

  importForm: FormGroup;

  cn: string;
  error = false;
  errorMessage: String;
  isSaving: boolean;

  constructor(private eventManager: EventManager, private certificateService: CertificateService, public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.importForm = new FormGroup({
      cn: new FormControl({ value: '', disabled: false }),
      certificateStore: new FormControl({ value: 'keystore', disabled: false }),
    });

    this.importForm.patchValue({
      cn: '',
      certificateStore: 'keystore',
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
