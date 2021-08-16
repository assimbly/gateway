import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { ActivatedRoute, Router } from '@angular/router';

import { IQueue } from 'app/shared/model/queue.model';
import { QueueService } from './queue.service';
import { IAddress } from 'app/shared/model/address.model';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    templateUrl: './queue-delete-dialog.component.html'
})
export class QueueDeleteDialogComponent {
    queue?: IQueue;
    address?: IAddress;

    brokerType: string = '';
    brokers: IBroker[];

    message = 'Are you sure you want to delete this queue?';
    disableDelete: boolean;

    constructor(
        protected queueService: QueueService,
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
            this.message = 'Cannot delete queue because there is at least one active consumer';
            this.disableDelete = true;
        } else if (this.address.numberOfMessages > 0) {
            this.message = 'Cannot delete queue because there is at least one message on the queue. Please purge the queue before deleting';
            this.disableDelete = true;
        } else {
            this.queueService.deleteQueue(name, this.brokerType).subscribe(() => {
                this.eventManager.broadcast('queueListModification');
                this.router.navigate(['/queue']).then(() => {
                    window.location.reload();
                });
                // this.activeModal.close();
                this.activeModal.close();
            });
        }
    }

    getBrokerType(): void {
        this.queueService.getBrokers().subscribe(
            data => {
                if (data) {
                    for (let i = 0; i < data.body.length; i++) {
                        this.brokers.push(data.body[i]);
                        this.brokerType = this.brokers[0].type;
                    }
                }
            },
            error => console.log(error)
        );
    }
}

@Component({
    selector: 'jhi-queue-delete-popup',
    template: ''
})
export class QueueDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ queue }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(QueueDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.queue = queue;
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
