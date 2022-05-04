import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { ICertificate } from 'app/shared/model/certificate.model';
import { CertificateService } from './certificate.service';

@Component({
    selector: 'jhi-certificate-delete-dialog',
    templateUrl: './certificate-delete-dialog.component.html'
})
export class CertificateDeleteDialogComponent {
    certificate: ICertificate;

    constructor(protected certificateService: CertificateService, public activeModal: NgbActiveModal, protected eventManager: EventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.certificateService.deleteCertificate(this.certificate.certificateName).subscribe(res => {
            this.certificateService.delete(id).subscribe(response => {
			    this.eventManager.broadcast(new EventWithContent('certificateListModification', 'Deleted an certificate'));
                this.activeModal.dismiss(true);
            });
        });
    }
}