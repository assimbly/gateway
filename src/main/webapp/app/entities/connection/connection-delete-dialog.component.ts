import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionService } from './connection.service';

@Component({
    selector: 'jhi-connection-delete-dialog',
    templateUrl: './connection-delete-dialog.component.html',
    imports: [FontAwesomeModule, AlertError],
})
export class ConnectionDeleteDialogComponent {
    protected connectionService = inject(ConnectionService);
    activeModal = inject(NgbActiveModal);
    protected eventManager = inject(EventManager);

    connection!: IConnection;
    errorMessage = false;
    deleteMode = true;

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

    private onDeleteError(error: unknown) {
        this.errorMessage = true;
        this.deleteMode = false;
    }
}
