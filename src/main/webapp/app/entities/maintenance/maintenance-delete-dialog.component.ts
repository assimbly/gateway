import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

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
        protected eventManager: JhiEventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.maintenanceService.delete(id).subscribe(response => {
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
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ maintenance }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(MaintenanceDeleteDialogComponent as Component, {
                    size: 'lg',
                    backdrop: 'static'
                });
                this.ngbModalRef.componentInstance.maintenance = maintenance;
                this.ngbModalRef.result.then(
                    result => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    },
                    reason => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    }
                );
            }, 0);
        });
    }

    ngOnDestroy() {
        this.ngbModalRef = null;
    }
}
