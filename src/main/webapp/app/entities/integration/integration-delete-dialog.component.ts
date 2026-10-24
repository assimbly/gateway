import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationService } from './integration.service';

@Component({
    selector: 'jhi-integration-delete-dialog',
    templateUrl: './integration-delete-dialog.component.html',
    imports: [FontAwesomeModule, AlertError],
})
export class IntegrationDeleteDialogComponent {
    integration: IIntegration;
    /** True while the delete runs, so a second click doesn't send it again. */
    readonly deleting = signal(false);

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
        this.deleting.set(true);
        this.integrationService.delete(id).subscribe({
            next: () => {
                this.eventManager.broadcast(new EventWithContent('integrationListModification', 'Deleted a integration'));
                this.activeModal.dismiss(true);
            },
            error: () => this.deleting.set(false),
        });
    }
}
