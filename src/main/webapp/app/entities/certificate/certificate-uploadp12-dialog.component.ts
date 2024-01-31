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
  selector: 'jhi-certificate-uploadp12-dialog',
  templateUrl: './certificate-uploadp12-dialog.component.html',
})
export class CertificateUploadP12DialogComponent implements OnInit, AfterContentInit {
  certificate: ICertificate;
  certificateId: number;
  securities: Array<ICertificate> = [];

  importForm: FormGroup;
  certificateFile: any;
  fileName = 'Choose file';
  fileNameWithoutExtension: string;
  fileType: string;
  uploadError = false;
  uploadErrorMessage: String;

  constructor(private eventManager: EventManager, private certificateService: CertificateService, public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.importForm = new FormGroup({
      password: new FormControl({ value: '', disabled: false }),
      certificateStore: new FormControl({ value: 'keystore', disabled: false }),
    });

    this.importForm.patchValue({
      password: '',
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

  openFile(event) {
    const reader = new FileReader();
    reader.onload = () => {
      this.certificateFile = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);

    this.fileName = event.target.files[0].name;
    this.fileNameWithoutExtension = this.fileName.split('.').slice(0, -1).join('.');
    this.fileType = this.fileName.substring(this.fileName.lastIndexOf('.') + 1);
  }

  uploadP12Certificate() {
    const password = <FormGroup>this.importForm.controls['password'].value;
    const certificateStore = <FormGroup>this.importForm.controls['certificateStore'].value;

    this.certificateService.uploadP12Certificate(certificateStore + '.jks', this.certificateFile, this.fileType, password).subscribe(
      data => {
        const json = JSON.parse(data.body);

        console.log('json=' + json);

        const certificate = json.certificates.certificate[0];

        this.certificate.certificateName = certificate.certificateName;

        this.certificate.certificateStore = certificate.certificateStore;
        console.log('this.certificate.certificateName=' + this.certificate.certificateName);
        console.log('this.certificate.certificateStore=' + this.certificate.certificateStore);

        this.certificate.certificateFile = this.certificateFile;
        this.certificate.certificateName = certificate.certificateName;
        this.certificate.certificateStore = certificateStore + '.jks';
        this.certificate.certificateExpiry = dayjs(certificate.certificateExpiry, DATE_TIME_FORMAT);
        this.certificate.url = 'P12 (' + this.fileNameWithoutExtension + ')';

        this.certificateService.create(this.certificate).subscribe(
          res => {
            this.uploadError = false;
            this.activeModal.dismiss(true);
		    this.eventManager.broadcast(new EventWithContent('certificateListModification', 'OK'));
          },
          err => {
            this.uploadError = true;
            this.uploadErrorMessage = err.error;
            console.log(err);
          }
        );
      },
      err => {
        this.uploadError = true;
        this.uploadErrorMessage = err.error;
        console.log(err);
      }
    );
  }
}
