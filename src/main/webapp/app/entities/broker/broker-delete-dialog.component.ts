import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IBroker } from 'app/shared/model/broker.model';
import { BrokerService } from './broker.service';

@Component({
    selector: 'jhi-broker-delete-dialog',
    templateUrl: './broker-delete-dialog.component.html',
    imports: [FormsModule, FontAwesomeModule, AlertError],
})
export class BrokerDeleteDialogComponent {
    broker: IBroker;
    /** True while the delete runs, so a second click doesn't send it again. */
    readonly deleting = signal(false);

    constructor(protected brokerService: BrokerService, public activeModal: NgbActiveModal, protected eventManager: EventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.deleting.set(true);
        this.brokerService.delete(id).subscribe({
            next: () => {
                this.eventManager.broadcast(new EventWithContent('brokerListModification', 'Deleted an broker'));
                this.activeModal.close('deleted');
            },
            error: () => this.deleting.set(false),
        });
    }
}
