import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IMaintenance } from 'app/shared/model/maintenance.model';
import { MaintenanceService } from './maintenance.service';

@Component({
    selector: 'jhi-maintenance-delete-dialog',
    templateUrl: './maintenance-delete-dialog.component.html'
})
export class MaintenanceDeleteDialogComponent {
    maintenance: IMaintenance;

    constructor(
        protected maintenanceService: MaintenanceService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.maintenanceService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('maintenanceListModification', 'Deleted an maintenance'));
            this.activeModal.dismiss(true);
        });
    }
}