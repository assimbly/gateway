import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IQueue } from 'app/shared/model/queue.model';
import { QueueService } from './queue.service';

@Component({
    templateUrl: './queue-delete-dialog.component.html'
})
export class QueueDeleteDialogComponent {
    queue?: IQueue;

    constructor(protected queueService: QueueService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmDelete(id: number): void {
        this.queueService.delete(id).subscribe(() => {
            this.eventManager.broadcast('queueListModification');
            this.activeModal.close();
        });
    }
}
