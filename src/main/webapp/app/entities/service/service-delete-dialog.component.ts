import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { IService } from 'app/shared/model/service.model';
import { ServiceService } from './service.service';

@Component({
    selector: 'jhi-service-delete-dialog',
    templateUrl: './service-delete-dialog.component.html'
})
export class ServiceDeleteDialogComponent {
    service: IService;
    errorMessage = false;
    deleteMode = true;

    constructor(
        protected serviceService: ServiceService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.serviceService.delete(id).subscribe(
            response => {
			    this.eventManager.broadcast(new EventWithContent('serviceListModification', 'Deleted an service'));
                this.activeModal.dismiss(true);
            },
            r => this.onDeleteError(r)
        );
    }

    private onDeleteError(error) {
        this.errorMessage = true;
        this.deleteMode = false;
    }
}