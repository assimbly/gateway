import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AccountService } from 'app/core';

import { IQueue } from 'app/shared/model/queue.model';
import { IAddresses, IAddress, Address } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { QueueService } from './queue.service';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';

@Component({
    selector: 'jhi-queue',
    templateUrl: './queue.component.html'
})
export class QueueComponent implements OnInit, OnDestroy {
    public isAdmin: boolean;
    queues: IQueue[];
    addresses: IAddress[];
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

    constructor(
        protected queueService: QueueService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected modalService: NgbModal,
        protected parseLinks: JhiParseLinks,
        protected accountService: AccountService
    ) {
        this.queues = [];
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 0;
        this.links = {
            last: 0
        };
        this.predicate = 'id';
        this.ascending = true;
    }

    loadAll(): void {
        alert('test');

        this.queueService.getAllQueues('classic').subscribe(
            (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers),
            (res: HttpErrorResponse) => this.onError(res.message)
        );

        this.queueService
            .query({
                page: this.page,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe((res: HttpResponse<IQueue[]>) => this.paginateQueues(res.body, res.headers));

        //         this.addresses = this.parseXmlToAddresses("hello");
    }

    reset(): void {
        this.page = 0;
        this.queues = [];
        this.loadAll();
    }

    loadPage(page: number): void {
        this.page = page;
        this.loadAll();
    }

    ngOnInit(): void {
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
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    protected paginateQueues(data: IQueue[] | null, headers: HttpHeaders): void {
        const headersLink = headers.get('link');
        this.links = this.parseLinks.parse(headersLink ? headersLink : '');
        if (data) {
            for (let i = 0; i < data.length; i++) {
                this.queues.push(data[i]);
            }
        }
    }

    protected parseXmlToAddresses(xmlInput: string): IAddress[] {
        let addressList: IAddress[] = [];
        addressList.push(new Address(1, 'hoi', 'hallo', 2, 3, 4));
        addressList.push(new Address(2, 'doei', 'dag', 5, 6, 7));

        return addressList;
    }

    private onSuccess(data, headers) {
        //         if (this.gateways.length === 1) {
        //             this.links = this.parseLinks.parse(headers.get('link'));
        //         }

        this.dummy = data;

        alert('BLAAAAAAAAAAAAAAAAAAAAAAAAAAAT   ' + this.dummy);

        this.addresses = new Array<IAddress>();
        for (let i = 0; i < data.queues.length; i++) {
            this.addresses.push(data.queues[i]);
        }

        let str = JSON.stringify(data, null, 4);
        console.log('BLAAAAAAAAAAAAAAAAAAAAAAAAAAAT   ' + str);
        alert('BLAAAAAAAAAAAAAAAAAAAAAAAAAAAT   ' + str);
        this.totalItems = headers.get('X-Total-Count');
    }

    protected onError(errorMessage: string) {
        alert('ERRORRRRRRRRRRRRRRRRRR   ');
        this.jhiAlertService.error('ERRORRRRRRRRRRRRRRRRRR' + errorMessage, null, null);
    }
}
