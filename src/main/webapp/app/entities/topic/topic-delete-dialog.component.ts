import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IAddress } from 'app/shared/model/address.model';
import { TopicService } from './topic.service';

@Component({
    templateUrl: './topic-delete-dialog.component.html',
    imports: [CommonModule, FontAwesomeModule, AlertError],
})
export class TopicDeleteDialogComponent {
    address?: IAddress;
    brokerType = '';

    message = 'Are you sure you want to delete this topic?';
    disableDelete = false;

    constructor(
        protected topicService: TopicService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
    ) {}

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmDelete(name: string): void {
        if (this.address?.numberOfConsumers > 0) {
            this.message = 'Cannot delete topic because there is at least one active consumer';
            this.disableDelete = true;
            return;
        }
        if (this.address?.numberOfMessages > 0) {
            this.message = 'Cannot delete topic because there is at least one message on the topic. Please clear the topic before deleting';
            this.disableDelete = true;
            return;
        }

        this.disableDelete = true;
        this.topicService.deleteTopic(name, this.brokerType).subscribe(() => {
            this.eventManager.broadcast(new EventWithContent('topicListModification', 'deleted'));
            this.activeModal.dismiss();
        });
    }
}
