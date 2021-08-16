import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AccountService } from 'app/core';

import { IQueue } from 'app/shared/model/queue.model';
import { IRootAddress, IAddress, Address } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { QueueService } from './queue.service';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';
import { QueueClearDialogComponent } from './queue-clear-dialog.component';
import { IBroker } from 'app/shared/model/broker.model';
import { BrokerService } from 'app/entities/broker';
import { IFlow } from 'app/shared/model/flow.model';

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

    dummy: any;

    searchText: string = '';
    brokerType: string = '';

    constructor(
        protected queueService: QueueService,
        protected brokerService: BrokerService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected modalService: NgbModal,
        protected parseLinks: JhiParseLinks,
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
        // this.addresses = this.getAllQueues(this.brokerType);
    }

    reset(): void {
        this.page = 0;
        this.addresses = [];
        this.loadAll();
    }

    loadPage(page: number): void {
        this.page = page;
        this.loadAll();
    }

    ngOnInit(): void {
        // this.loadBrokers();
        this.loadAll();
        this.registerChangeInQueues();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
            this.queueService.connect();
        });
        this.accountService.hasAuthority('ROLE_ADMIN').then(r => (this.isAdmin = r));
    }

    ngOnDestroy(): void {
        if (this.eventSubscriber) {
            this.eventManager.destroy(this.eventSubscriber);
        }
    }

    trackId(index: number, item: IQueue): number {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return item.id!;
    }

    registerChangeInQueues(): void {
        this.eventSubscriber = this.eventManager.subscribe('queueListModification', () => this.reset());
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
                    for (let i = 0; i < data.body.queues.queue.length; i++) {
                        addresses.push(data.body.queues.queue[i]);
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
                    for (let i = 0; i < data.body.length; i++) {
                        this.brokers.push(data.body[i]);
                    }
                    this.addresses = this.getAllQueues(this.brokers[0].type);
                }
            },
            error => console.log(error)
        );
        return this.brokers[0].type;
    }

    protected paginateQueues(data: IRootAddress | null, headers: HttpHeaders): void {
        const headersLink = headers.get('link');

        this.addresses = new Array<IAddress>();

        if (data) {
            for (let i = 0; i < data.queues.queue.length; i++) {
                this.addresses.push(data.queues.queue[i]);
            }
        }

        // this.links = this.parseLinks.parse(headersLink ? headersLink : '');
    }

    private onSuccess(data: IRootAddress, headers) {
        this.addresses = new Array<IAddress>();
        for (let i = 0; i < data.queues.queue.length; i++) {
            this.addresses.push(data.queues.queue[i]);
        }

        this.totalItems = headers.get('X-Total-Count');
    }

    private onSuccessBroker(data: IBroker[], headers) {
        for (let i = 0; i < data.length; i++) {
            this.brokers.push(data[i]);
        }
        //Currently, only one broker is configured so brokerType = this.brokers[0].brokerType. In future, use something like selectedBroker
        this.brokerType = this.brokers[0].type;
        this.totalItems = headers.get('X-Total-Count');
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
