import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IMessage } from 'app/shared/model/message.model';
import { MessageService } from './message.service';

@Component({
    standalone: false,
    selector: 'jhi-message-delete-dialog',
    templateUrl: './message-delete-dialog.component.html'
})
export class MessageDeleteDialogComponent {
    message: IMessage;
    errorMessage = false;
    deleteMode = true;

    constructor(protected messageService: MessageService, public activeModal: NgbActiveModal, protected eventManager: EventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.messageService.delete(id).subscribe(
            response => {
				this.eventManager.broadcast(new EventWithContent('messageListModification', 'Deleted an message'));
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
