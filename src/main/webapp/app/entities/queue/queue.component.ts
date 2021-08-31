import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AccountService } from 'app/core';

import { IQueue } from 'app/shared/model/queue.model';
import { IAddress, Address } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { QueueService } from './queue.service';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';
import { IBroker } from 'app/shared/model/broker.model';
import { BrokerService } from 'app/entities/broker';
import { startWith, switchMap } from 'rxjs/operators';

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
    totalItems: number = -1;
    ascending: boolean;
    timeInterval: Subscription;

    dummy: any;

    searchText: string = '';
    brokerType: string = '';

    constructor(
        protected queueService: QueueService,
        protected brokerService: BrokerService,
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

    loadAll(): void {
        this.brokerType = this.getBrokerType();
        this.addresses = this.getAllQueues(this.brokerType);
    }

    reset(): void {
        this.addresses = [];
        this.loadAll();
    }

    loadPage(page: number): void {
        this.page = page;
        this.loadAll();
    }

    ngOnInit(): void {
        this.accountService.identity().then(account => {
            this.currentAccount = account;
            this.queueService.connect();
        });
        this.accountService.hasAuthority('ROLE_ADMIN').then(r => (this.isAdmin = r));

        this.registerChangeInQueues();
        this.registerDeletedQueues();
        this.poll();
        this.loadAll();
    }

    ngAfterViewInit() {
        this.loadAll();
        this.registerChangeInQueues();
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
        this.timeInterval = interval(5000)
            .pipe(
                startWith(0),
                switchMap(() => this.queueService.getAllQueues(this.brokerType))
            )
            .subscribe(
                _ => {
                    this.eventManager.broadcast('queueListModification');
                    // this.addresses = res.body.queues.queue
                    // this.reset();
                },
                err => console.log('HTTP Error', err)
            );
    }

    registerDeletedQueues() {
        this.eventManager.subscribe('queueDeleted', res => {
            this.reset();
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

    getAllQueues(brokerType: string): IAddress[] {
        let addresses: Address[] = [];

        this.queueService.getAllQueues(brokerType).subscribe(
            data => {
                if (data) {
                    for (let address of data.body.queues.queue) {
                        addresses.push(address);
                    }
                }
            },
            error => console.log(error)
        );
        return addresses;
    }

    getBrokerType(): string {
        this.queueService.getBrokers().subscribe(
            data => {
                if (data) {
                    for (let broker of data.body) {
                        this.brokers.push(broker);
                    }
                    this.addresses = this.getAllQueues(this.brokers[0].type);
                }
            },
            error => console.log(error)
        );
        return this.brokers[0].type;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
