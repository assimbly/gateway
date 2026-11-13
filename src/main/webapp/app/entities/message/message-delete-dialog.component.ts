import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IMessage } from 'app/shared/model/message.model';
import { MessageService } from './message.service';

@Component({
    selector: 'jhi-message-delete-dialog',
    templateUrl: './message-delete-dialog.component.html',
    imports: [FontAwesomeModule, AlertError],
})
export class MessageDeleteDialogComponent {
    protected messageService = inject(MessageService);
    activeModal = inject(NgbActiveModal);
    protected eventManager = inject(EventManager);

    message!: IMessage;
    errorMessage = false;
    deleteMode = true;

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

    private onDeleteError(error: unknown) {
        this.errorMessage = true;
        this.deleteMode = false;
    }
}
