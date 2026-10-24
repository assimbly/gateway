import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';

@Component({
    selector: 'jhi-environment-variables-delete-dialog',
    templateUrl: './environment-variables-delete-dialog.component.html',
    imports: [FontAwesomeModule, AlertError],
})
export class EnvironmentVariablesDeleteDialogComponent {
    environmentVariables: IEnvironmentVariables;
    /** True while the delete runs, so a second click doesn't send it again. */
    readonly deleting = signal(false);

    constructor(
        protected environmentVariablesService: EnvironmentVariablesService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        if (id == null) {
            return;
        }
        this.deleting.set(true);
        this.environmentVariablesService.delete(id).subscribe({
            next: () => {
                this.eventManager.broadcast(new EventWithContent('environmentVariablesListModification', 'Deleted an environmentVariables'));
                this.activeModal.close('deleted');
            },
            error: () => this.deleting.set(false),
        });
    }
}
