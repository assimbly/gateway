import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { SecurityService } from './security.service';
import { ISecurity } from 'app/shared/model/security.model';
import { SecurityPopupService } from 'app/entities/security/security-popup.service';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import * as moment from 'moment';

@Component({
  selector: 'jhi-security-upload-dialog',
  templateUrl: './security-upload-dialog.component.html',
})
export class SecurityUploadDialogComponent implements AfterContentInit {
  security: ISecurity;
  securityId: number;
  securities: Array<ISecurity> = [];
  certificateFile: any;
  certificateStore = 'truststore';
  fileName = 'Choose file';
  fileNameWithoutExtension: string;
  fileType: string;
  password: string;
  uploadError = false;
  uploadErrorMessage: String;

  constructor(private eventManager: JhiEventManager, private securityService: SecurityService, public activeModal: NgbActiveModal) {}

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
    this.fileNameWithoutExtension = this.fileName.split('.').slice(0, -1).join('.');
    this.fileType = this.fileName.substring(this.fileName.lastIndexOf('.') + 1);
  }

  uploadCertificate() {
    this.securityService.uploadCertificate(this.certificateStore + '.jks', this.certificateFile, this.fileType).subscribe(
      data => {
        const json = JSON.parse(data.body);

        const certificate = json.certificates.certificate[0];

        this.security.certificateName = certificate.certificateName;

        console.log('this.security.certificateName=' + this.security.certificateName);

        this.security.certificateFile = certificate.certificateFile;
        this.security.certificateName = certificate.certificateName;
        this.security.certificateStore = certificate.certificateStore;
        this.security.certificateExpiry = moment(certificate.certificateExpiry, DATE_TIME_FORMAT);
        this.security.url = 'Generic (' + this.fileNameWithoutExtension + ')';

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
export class SecurityUploadPopupComponent implements OnInit, OnDestroy {
  routeSub: any;

  constructor(protected route: ActivatedRoute, protected securityPopupService: SecurityPopupService) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(() => {
      this.securityPopupService.open(SecurityUploadDialogComponent as Component);
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
