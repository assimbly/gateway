import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IConnectionKeys } from 'app/shared/model/connection-keys.model';
import { ConnectionKeysService } from './connection-keys.service';

@Component({
    standalone: false,
    selector: 'jhi-connection-keys-delete-dialog',
    templateUrl: './connection-keys-delete-dialog.component.html'
})
export class ConnectionKeysDeleteDialogComponent {
    connectionKeys: IConnectionKeys;

    constructor(
        protected connectionKeysService: ConnectionKeysService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.connectionKeysService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('connectionKeysListModification', 'Deleted an connectionKeys'));
            this.activeModal.dismiss(true);
        });
    }
}
