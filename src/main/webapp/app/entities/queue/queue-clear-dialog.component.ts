import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IAddress } from 'app/shared/model/address.model';
import { QueueService } from './queue.service';

@Component({
    templateUrl: './queue-clear-dialog.component.html',
    imports: [CommonModule, FontAwesomeModule, AlertError],
})
export class QueueClearDialogComponent {
    address?: IAddress;
    brokerType = '';

    message = 'Are you sure you want to clear this queue?';
    disableClear = false;

    constructor(
        protected queueService: QueueService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
    ) {}

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmClear(name: string): void {
        this.disableClear = true;
        this.queueService.clearQueue(name, this.brokerType).subscribe(() => {
            this.eventManager.broadcast(new EventWithContent('queueListModification', 'cleared'));
            this.activeModal.close();
        });
    }
}
