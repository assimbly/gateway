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
  selector: 'jhi-security-uploadp12-dialog',
  templateUrl: './security-uploadp12-dialog.component.html',
})
export class SecurityUploadP12DialogComponent implements OnInit, AfterContentInit {
  security: ISecurity;
  securityId: number;
  securities: Array<ISecurity> = [];

  importForm: FormGroup;
  certificateFile: any;
  fileName = 'Choose file';
  fileNameWithoutExtension: string;
  fileType: string;
  uploadError = false;
  uploadErrorMessage: String;

  constructor(private eventManager: JhiEventManager, private securityService: SecurityService, public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.importForm = new FormGroup({
      password: new FormControl({ value: '' }),
      certificateStore: new FormControl({ value: 'keystore' }),
    });

    this.importForm.patchValue({
      password: '',
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

    this.securityService.uploadP12Certificate(certificateStore + '.jks', this.certificateFile, this.fileType, password).subscribe(
      data => {
        const json = JSON.parse(data.body);

        console.log('json=' + json);

        const certificate = json.certificates.certificate[0];

        this.security.certificateName = certificate.certificateName;

        this.security.certificateStore = certificate.certificateStore;
        console.log('this.security.certificateName=' + this.security.certificateName);
        console.log('this.security.certificateStore=' + this.security.certificateStore);

        this.security.certificateFile = this.certificateFile;
        this.security.certificateName = certificate.certificateName;
        this.security.certificateStore = certificateStore + '.jks';
        this.security.certificateExpiry = moment(certificate.certificateExpiry, DATE_TIME_FORMAT);
        this.security.url = 'P12 (' + this.fileNameWithoutExtension + ')';

        this.securityService.create(this.security).subscribe(
          res => {
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
  template: '',
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
