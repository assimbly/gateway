import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IEndpoint } from 'app/shared/model/endpoint.model';
import { EndpointService } from './endpoint.service';

@Component({
    selector: 'jhi-endpoint-delete-dialog',
    templateUrl: './endpoint-delete-dialog.component.html'
})
export class EndpointDeleteDialogComponent {
    endpoint: IEndpoint;

    constructor(
        protected endpointService: EndpointService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.endpointService.delete(id).subscribe(response => {
			this.eventManager.broadcast(new EventWithContent('endpointListModification', 'Deleted an endpoint'));
            this.activeModal.dismiss(true);
        });
    }
}