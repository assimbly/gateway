import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { CertificateService, CERTIFICATE_NAME_PATTERN, TRUSTSTORE, toCertificateName } from './certificate.service';

@Component({
  selector: 'jhi-certificate-upload-dialog',
  templateUrl: './certificate-upload-dialog.component.html',
  imports: [FormsModule],
})
export class CertificateUploadDialogComponent {
  private eventManager = inject(EventManager);
  private certificateService = inject(CertificateService);
  activeModal = inject(NgbActiveModal);

  readonly truststore = TRUSTSTORE;
  readonly namePattern = CERTIFICATE_NAME_PATTERN;
  name = '';
  certificateFile!: string;
  fileName = 'Choose file';
  fileNameWithoutExtension!: string;
  isSaving = false;
  uploadError = false;
  uploadErrorMessage!: String;

  clear() {
    this.activeModal.dismiss('cancel');
  }

  openFile(event: Event) {
    const reader = new FileReader();
    reader.onload = () => {
      // as data URL (base64), so binary DER files arrive intact
      this.certificateFile = reader.result as string;
    };
    reader.readAsDataURL((event.target as HTMLInputElement).files![0]);

    this.fileName = (event.target as HTMLInputElement).files![0].name;
    this.fileNameWithoutExtension = this.fileName.split('.').slice(0, -1).join('.');
    if (!this.name) {
      this.name = toCertificateName(this.fileNameWithoutExtension);
    }
  }

  importCertificates() {
    this.isSaving = true;
    this.certificateService
      .importTrustedCertificates(this.name, this.certificateFile)
      .pipe(
        switchMap(res => this.certificateService.createFromRuntimeResponse(res.body!, 'Trusted (' + this.fileNameWithoutExtension + ')')),
      )
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
        },
      );
  }
}
