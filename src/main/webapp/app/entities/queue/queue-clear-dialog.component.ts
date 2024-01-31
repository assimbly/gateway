import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { Router } from '@angular/router';

import { IQueue } from 'app/shared/model/queue.model';
import { QueueService } from './queue.service';
import { IAddress } from 'app/shared/model/address.model';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    templateUrl: './queue-clear-dialog.component.html'
})
export class QueueClearDialogComponent {
    queue?: IQueue;
    address?: IAddress;

    brokerType = '';
    brokers: IBroker[];

    message = 'Are you sure you want to clear this queue?';
    disableClear: boolean;

    constructor(
        protected queueService: QueueService,
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
            this.message = 'Are you sure this queue has active consumers?';
            // this.disableClear = true;
        } else {
            this.queueService.clearQueue(name, this.brokerType).subscribe(() => {
				this.eventManager.broadcast(new EventWithContent('queueListModification', 'cleared'));			
                this.address.numberOfMessages = 0;
                this.router.navigate(['/queue']);
                this.activeModal.dismiss(true);
            });
            /*
            this.queueService.clearQueue(name, this.brokerType).subscribe(
                res => {
                    this.eventManager.broadcast('queueListModification');
                },
                res => {
                    console.log(res);
                }
            );
            this.activeModal.close();
            */
        }
    }

    getBrokerType(): void {
        this.queueService.getBrokers().subscribe(
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
