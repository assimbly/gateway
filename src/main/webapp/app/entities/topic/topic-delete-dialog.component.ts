import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { ActivatedRoute, Router } from '@angular/router';

import { ITopic } from 'app/shared/model/topic.model';
import { TopicService } from './topic.service';
import { IAddress } from 'app/shared/model/address.model';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    templateUrl: './topic-delete-dialog.component.html'
})
export class TopicDeleteDialogComponent {
    topic?: ITopic;
    address?: IAddress;

    brokerType = '';
    brokers: IBroker[];

    message = 'Are you sure you want to delete this topic?';
    disableDelete: boolean;

    constructor(
        protected topicService: TopicService,
        public activeModal: NgbActiveModal,
        protected eventManager: JhiEventManager,
        protected jhiAlertService: JhiAlertService,
        protected router: Router
    ) {
        this.brokers = [];
        this.getBrokerType();
        this.disableDelete = false;
    }

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmDelete(name: string): void {
        if (this.address.numberOfConsumers > 0) {
            this.message = 'Cannot delete topic because there is at least one active consumer';
            this.disableDelete = true;
        } else if (this.address.numberOfMessages > 0) {
            this.message = 'Cannot delete topic because there is at least one message on the topic. Please clear the topic before deleting';
            this.disableDelete = true;
        } else {
            this.topicService.deleteTopic(name, this.brokerType).subscribe(() => {
                this.eventManager.broadcast('topicListModification');
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

@Component({
    selector: 'jhi-topic-delete-popup',
    template: ''
})
export class TopicDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ topic }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(TopicDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.topic = topic;
                this.ngbModalRef.result.then(
                    result => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    },
                    reason => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    }
                );
            }, 0);
        });
    }

    ngOnDestroy() {
        this.ngbModalRef = null;
    }
}
