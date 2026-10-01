import { Component } from '@angular/core';
import { switchMap } from 'rxjs';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { ICertificate } from 'app/shared/model/certificate.model';
import { CertificateService } from './certificate.service';

@Component({
    selector: 'jhi-certificate-delete-dialog',
    templateUrl: './certificate-delete-dialog.component.html',
    imports: [FontAwesomeModule, AlertError],
})
export class CertificateDeleteDialogComponent {
    certificate: ICertificate;
    isDeleting = false;

    constructor(protected certificateService: CertificateService, public activeModal: NgbActiveModal, protected eventManager: EventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.isDeleting = true;
        this.certificateService
            .deleteCertificate(this.certificate.certificateName, this.certificate.certificateStore)
            .pipe(switchMap(() => this.certificateService.delete(id)))
            .subscribe({
                next: () => {
                    this.eventManager.broadcast(new EventWithContent('certificateListModification', 'Deleted a certificate'));
                    this.activeModal.dismiss(true);
                },
                error: () => (this.isDeleting = false),
            });
    }
}
