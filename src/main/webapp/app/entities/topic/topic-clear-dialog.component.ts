import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { Router } from '@angular/router';

import { ITopic } from 'app/shared/model/topic.model';
import { TopicService } from './topic.service';
import { IAddress } from 'app/shared/model/address.model';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    templateUrl: './topic-clear-dialog.component.html'
})
export class TopicClearDialogComponent {
    topic?: ITopic;
    address?: IAddress;

    brokerType = '';
    brokers: IBroker[];

    message = 'Are you sure you want to clear this topic?';
    disableClear: boolean;

    constructor(
        protected topicService: TopicService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
        protected router: Router
    ) {
        this.brokers = [];
        this.getBrokerType();
        this.disableClear = false;
    }

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmClear(name: string): void {
        if (this.address.numberOfConsumers > 0) {
            this.message = 'Cannot clear topic because there is at least one active consumer';
            this.disableClear = true;
        } else {
            this.topicService.clearTopic(name, this.brokerType).subscribe(() => {
				this.eventManager.broadcast(new EventWithContent('topicListModification', 'Cleared'));
                this.address.numberOfMessages = 0;
                this.router.navigate(['/topic']);
                this.activeModal.dismiss(true);
            });
        }
    }

    getBrokerType(): void {
        this.topicService.getBrokers().subscribe(
            data => {
                if (data) {
                    for (const broker of data.body) {
                        this.brokers.push(broker);
                        this.brokerType = broker.type;
                    }
                }
            },
            error => console.log(error)
        );
    }
}
