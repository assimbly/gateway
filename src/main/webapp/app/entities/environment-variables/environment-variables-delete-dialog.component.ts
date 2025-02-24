import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';

@Component({
    standalone: false,
    selector: 'jhi-environment-variables-delete-dialog',
    templateUrl: './environment-variables-delete-dialog.component.html'
})
export class EnvironmentVariablesDeleteDialogComponent {
    environmentVariables: IEnvironmentVariables;

    constructor(
        protected environmentVariablesService: EnvironmentVariablesService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.environmentVariablesService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('environmentVariablesListModification', 'Deleted an environmentVariables'));
            this.activeModal.dismiss(true);
        });
    }
}
