import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionService } from './connection.service';

@Component({
    selector: 'jhi-connection-delete-dialog',
    templateUrl: './connection-delete-dialog.component.html'
})
export class ConnectionDeleteDialogComponent {
    connection: IConnection;
    errorMessage = false;
    deleteMode = true;

    constructor(
        protected connectionService: ConnectionService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.connectionService.delete(id).subscribe(
            response => {
			    this.eventManager.broadcast(new EventWithContent('connectionListModification', 'Deleted an service'));
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
