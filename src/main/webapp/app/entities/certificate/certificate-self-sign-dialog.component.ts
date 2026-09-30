import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { CertificateService, IDENTITY_STORE } from './certificate.service';

@Component({
  selector: 'jhi-certificate-self-sign-dialog',
  templateUrl: './certificate-self-sign-dialog.component.html',
  imports: [CommonModule, FormsModule],
})
export class CertificateSelfSignDialogComponent {
  readonly identityStore = IDENTITY_STORE;
  cn = '';
  error = false;
  errorMessage: String;
  isSaving = false;

  constructor(private eventManager: EventManager, private certificateService: CertificateService, public activeModal: NgbActiveModal) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  generateIdentity() {
    this.isSaving = true;
    this.certificateService
      .generateIdentity(this.cn)
      .pipe(switchMap(res => this.certificateService.createFromRuntimeResponse(res.body, 'Self-Signed (' + this.cn + ')')))
      .subscribe(
        () => {
          this.error = false;
          this.activeModal.dismiss(true);
          this.eventManager.broadcast(new EventWithContent('certificateListModification', 'OK'));
        },
        err => {
          this.error = true;
          this.isSaving = false;
          this.errorMessage = err.error;
          console.log(err);
        },
      );
  }
}
