import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IAddress } from 'app/shared/model/address.model';
import { TopicService } from './topic.service';

@Component({
    templateUrl: './topic-clear-dialog.component.html',
    imports: [FontAwesomeModule, AlertError],
})
export class TopicClearDialogComponent {
    protected topicService = inject(TopicService);
    activeModal = inject(NgbActiveModal);
    protected eventManager = inject(EventManager);

    address?: IAddress;
    brokerType = '';

    message = 'Are you sure you want to clear this topic?';
    disableClear = false;

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmClear(name: string): void {
        this.disableClear = true;
        this.topicService.clearTopic(name, this.brokerType).subscribe(() => {
            this.eventManager.broadcast(new EventWithContent('topicListModification', 'cleared'));
            this.activeModal.close();
        });
    }

}
