import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IAddress } from 'app/shared/model/address.model';
import { QueueService } from './queue.service';

@Component({
    templateUrl: './queue-delete-dialog.component.html',
    imports: [CommonModule, FontAwesomeModule, AlertError],
})
export class QueueDeleteDialogComponent {
    address?: IAddress;
    brokerType = '';

    /** Replaces the confirmation question once the delete is refused or fails. */
    message?: string;
    disableDelete = false;

    constructor(
        protected queueService: QueueService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
        private cdr: ChangeDetectorRef,
    ) {}

    get text(): string {
        if (this.message) {
            return this.message;
        }
        const count = this.address?.numberOfMessages ?? 0;
        if (count > 0) {
            return `This queue has ${count} ${count === 1 ? 'message' : 'messages'}. Deleting the queue also deletes ${count === 1 ? 'it' : 'them'}. Are you sure?`;
        }
        return `Delete Queue '${this.address?.name}'? This cannot be undone.`;
    }

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmDelete(name: string): void {
        if (this.address?.numberOfConsumers > 0) {
            this.message = 'Cannot delete queue because there is at least one active consumer';
            this.disableDelete = true;
            return;
        }

        this.disableDelete = true;
        this.queueService.deleteQueue(name, this.brokerType).subscribe({
            next: () => {
                this.eventManager.broadcast(new EventWithContent('queueListModification', 'deleted'));
                this.activeModal.dismiss();
            },
            error: err => {
                const reason = this.reasonOf(err);
                this.message = `The queue could not be deleted: ${reason}`;
                this.disableDelete = false;
                this.cdr.markForCheck();
            },
        });
    }

    /** The runtime answers with a JSON text body that has a message. */
    private reasonOf(err: any): string {
        try {
            return JSON.parse(err?.error)?.message ?? err?.message;
        } catch {
            return err?.message ?? 'unknown error';
        }
    }
}
