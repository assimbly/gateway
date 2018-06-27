import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Maintenance } from './maintenance.model';
import { MaintenancePopupService } from './maintenance-popup.service';
import { MaintenanceService } from './maintenance.service';

@Component({
    selector: 'jhi-maintenance-delete-dialog',
    templateUrl: './maintenance-delete-dialog.component.html'
})
export class MaintenanceDeleteDialogComponent {

    maintenance: Maintenance;

    constructor(
        private maintenanceService: MaintenanceService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.maintenanceService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'maintenanceListModification',
                content: 'Deleted an maintenance'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-maintenance-delete-popup',
    template: ''
})
export class MaintenanceDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private maintenancePopupService: MaintenancePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.maintenancePopupService
                .open(MaintenanceDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
