import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IServiceKeys } from 'app/shared/model/service-keys.model';
import { ServiceKeysService } from './service-keys.service';

@Component({
    selector: 'jhi-service-keys-delete-dialog',
    templateUrl: './service-keys-delete-dialog.component.html'
})
export class ServiceKeysDeleteDialogComponent {
    serviceKeys: IServiceKeys;

    constructor(
        protected serviceKeysService: ServiceKeysService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.serviceKeysService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('serviceKeysListModification', 'Deleted an serviceKeys'));
            this.activeModal.dismiss(true);
        });
    }
}