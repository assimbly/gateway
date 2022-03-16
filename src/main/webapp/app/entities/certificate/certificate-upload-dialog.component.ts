import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { CertificateService } from './certificate.service';
import { ICertificate } from 'app/shared/model/certificate.model';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import dayjs from 'dayjs/esm';

@Component({
  selector: 'jhi-certificate-upload-dialog',
  templateUrl: './certificate-upload-dialog.component.html',
})
export class CertificateUploadDialogComponent implements AfterContentInit {
  certificate: ICertificate;
  certificateId: number;
  securities: Array<ICertificate> = [];
  certificateFile: any;
  certificateStore = 'truststore';
  fileName = 'Choose file';
  fileNameWithoutExtension: string;
  fileType: string;
  password: string;
  uploadError = false;
  uploadErrorMessage: String;

  constructor(private eventManager: EventManager, private certificateService: CertificateService, public activeModal: NgbActiveModal) {}

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
    reader.readAsBinaryString(event.target.files[0]);

    this.fileName = event.target.files[0].name;
    this.fileNameWithoutExtension = this.fileName.split('.').slice(0, -1).join('.');
    this.fileType = this.fileName.substring(this.fileName.lastIndexOf('.') + 1);
  }

  uploadCertificate() {
    this.certificateService.uploadCertificate(this.certificateStore + '.jks', this.certificateFile, this.fileType).subscribe(
      data => {
        const json = JSON.parse(data.body);

        const certificate = json.certificates.certificate[0];

        this.certificate.certificateName = certificate.certificateName;

        console.log('this.certificate.certificateName=' + this.certificate.certificateName);

        this.certificate.certificateFile = certificate.certificateFile;
        this.certificate.certificateName = certificate.certificateName;
        this.certificate.certificateStore = certificate.certificateStore;
        this.certificate.certificateExpiry = dayjs(certificate.certificateExpiry, DATE_TIME_FORMAT);
        this.certificate.url = 'Generic (' + this.fileNameWithoutExtension + ')';

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