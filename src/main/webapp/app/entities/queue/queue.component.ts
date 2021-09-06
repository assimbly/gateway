import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AccountService } from 'app/core';

import { IQueue } from 'app/shared/model/queue.model';
import { IAddress } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { QueueService } from './queue.service';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    selector: 'jhi-queue',
    templateUrl: './queue.component.html'
})
export class QueueComponent implements OnInit, OnDestroy {
    public isAdmin: boolean;
    queues: IQueue[];
    addresses: IAddress[];
    brokers: IBroker[];
    eventSubscriber?: Subscription;
    currentAccount: any;
    itemsPerPage: number;
    links: any;
    page: number;
    predicate: string;
    ascending: boolean;
    timeInterval: Subscription;

    searchText: string = '';
    brokerType: string = '';

    constructor(
        protected queueService: QueueService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected modalService: NgbModal,
        protected accountService: AccountService
    ) {
        this.queues = [];
        this.brokers = [];
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 0;
        this.links = {
            last: 0
        };
        this.predicate = 'name';
        this.ascending = false;
    }

    reset(): void {
        this.page = 0;
        this.updateAllQueues();
    }

    loadPage(page: number): void {
        this.page = page;
        this.getBrokerType();
    }

    ngOnInit(): void {
        this.registerChangeInQueues();
        this.registerDeletedQueues();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
            this.queueService.connect();
        });
        this.accountService.hasAuthority('ROLE_ADMIN').then(r => (this.isAdmin = r));
    }

    ngAfterViewInit() {
        this.getBrokerType();
        this.poll();
    }

    ngOnDestroy(): void {
        if (this.eventSubscriber) {
            this.eventManager.destroy(this.eventSubscriber);
        }
        this.timeInterval.unsubscribe();
    }

    trackId(index: number, item: IQueue): number {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return item.id!;
    }

    registerChangeInQueues(): void {
        this.eventSubscriber = this.eventManager.subscribe('queueListModification', () => this.reset());
    }

    poll(): void {
        this.timeInterval = interval(10000).subscribe(x => {
            this.updateAllQueues();
        });
    }

    registerDeletedQueues() {
        this.eventManager.subscribe('queueDeleted', res => {
            this.getBrokerType();
        });
    }

    delete(queue: IQueue): void {
        const modalRef = this.modalService.open(QueueDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.queue = queue;
    }

    sort(): string[] {
        const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
        if (this.predicate !== 'name') {
            result.push('name');
        }
        return result;
    }

    getBrokerType() {
        this.queueService.getBrokers().subscribe(
            data => {
                if (data) {
                    for (let i = 0; i < data.body.length; i++) {
                        this.brokers.push(data.body[i]);
                    }
                    this.brokerType = this.brokers[0].type;
                    if (this.brokerType != null) {
                        this.getAllQueues();
                    }
                }
            },
            error => console.log(error)
        );
    }

    getAllQueues() {
        this.addresses = [];

        this.queueService.getAllQueues(this.brokerType).subscribe(
            data => {
                if (data && data.body.queues.queue) {
                    for (let i = 0; i < data.body.queues.queue.length; i++) {
                        if (data.body.queues.queue[i].temporary.toString() === 'false') {
                            this.addresses.push(data.body.queues.queue[i]);
                        }
                    }
                }
            },
            error => console.log(error)
        );
    }

    updateAllQueues() {
        this.queueService.getAllQueues(this.brokerType).subscribe(
            data => {
                if (data && data.body.queues.queue) {
                    for (let i = 0; i < data.body.queues.queue.length; i++) {
                        //exclude temporary queues
                        if (data.body.queues.queue[i].temporary.toString() === 'false') {
                            this.addresses.splice(i, 1, data.body.queues.queue[i]);
                        }
                    }
                    this.addresses = [...this.addresses];
                }
            },
            error => console.log(error)
        );
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
