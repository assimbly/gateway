import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationService } from './integration.service';

@Component({
    selector: 'jhi-integration-delete-dialog',
    templateUrl: './integration-delete-dialog.component.html'
})
export class IntegrationDeleteDialogComponent {
    integration: IIntegration;

    constructor(
        protected integrationService: IntegrationService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
        protected router: Router
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.integrationService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('integrationListModification', 'Deleted a integration'));
            this.activeModal.dismiss(true);
        });
    }
}
