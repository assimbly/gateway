import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { CertificateService, CERTIFICATE_NAME_PATTERN, IDENTITY_STORE, toCertificateName } from './certificate.service';

@Component({
  selector: 'jhi-certificate-uploadp12-dialog',
  templateUrl: './certificate-uploadp12-dialog.component.html',
  imports: [CommonModule, FormsModule],
})
export class CertificateUploadP12DialogComponent {
  readonly identityStore = IDENTITY_STORE;
  readonly namePattern = CERTIFICATE_NAME_PATTERN;
  name = '';
  certificateFile: string;
  password = '';
  fileName = 'Choose file';
  fileNameWithoutExtension: string;
  isSaving = false;
  uploadError = false;
  uploadErrorMessage: String;

  constructor(private eventManager: EventManager, private certificateService: CertificateService, public activeModal: NgbActiveModal) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  openFile(event) {
    const reader = new FileReader();
    reader.onload = () => {
      this.certificateFile = reader.result as string;
    };
    reader.readAsDataURL(event.target.files[0]);

    this.fileName = event.target.files[0].name;
    this.fileNameWithoutExtension = this.fileName.split('.').slice(0, -1).join('.');
    if (!this.name) {
      this.name = toCertificateName(this.fileNameWithoutExtension);
    }
  }

  importIdentity() {
    this.isSaving = true;
    // the record stores the certificate the runtime returns, never the uploaded file with its private key
    this.certificateService
      .importIdentity(this.name, this.certificateFile, this.password)
      .pipe(switchMap(res => this.certificateService.createFromRuntimeResponse(res.body, 'Identity (' + this.fileNameWithoutExtension + ')')))
      .subscribe(
        () => {
          this.uploadError = false;
          this.activeModal.dismiss(true);
          this.eventManager.broadcast(new EventWithContent('certificateListModification', 'OK'));
        },
        err => {
          this.isSaving = false;
          this.uploadError = true;
          this.uploadErrorMessage = err.error;
          console.log(err);
        },
      );
  }
}
