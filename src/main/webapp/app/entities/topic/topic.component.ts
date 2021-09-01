import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AccountService } from 'app/core';

import { ITopic } from 'app/shared/model/topic.model';
import { IAddress } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { TopicService } from './topic.service';
import { TopicDeleteDialogComponent } from './topic-delete-dialog.component';
import { IBroker } from 'app/shared/model/broker.model';
import { BrokerService } from 'app/entities/broker';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
    selector: 'jhi-topic',
    templateUrl: './topic.component.html'
})
export class TopicComponent implements OnInit, OnDestroy {
    public isAdmin: boolean;
    topics: ITopic[];
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
        protected topicService: TopicService,
        protected brokerService: BrokerService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected modalService: NgbModal,
        protected accountService: AccountService
    ) {
        this.topics = [];
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
        this.getBrokerType();
    }

    loadPage(page: number): void {
        this.page = page;
        this.getBrokerType();
    }

    ngOnInit(): void {
        this.registerChangeInTopics();
        this.registerDeletedTopics();

        this.accountService.identity().then(account => {
            this.currentAccount = account;
            this.topicService.connect();
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

    trackId(index: number, item: ITopic): number {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return item.id!;
    }

    registerChangeInTopics(): void {
        this.eventSubscriber = this.eventManager.subscribe('topicListModification', () => this.reset());
    }

    poll(): void {
        this.timeInterval = interval(5000)
            .pipe(
                startWith(0),
                switchMap(() => this.topicService.getAllTopics(this.brokerType))
            )
            .subscribe(
                _ => {
                    this.eventManager.broadcast('topicListModification');
                },
                err => console.log('HTTP Error', err)
            );
    }

    registerDeletedTopics() {
        this.eventManager.subscribe('topicDeleted', res => {
            this.getBrokerType();
        });
    }

    delete(topic: ITopic): void {
        const modalRef = this.modalService.open(TopicDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.topic = topic;
    }

    sort(): string[] {
        const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
        if (this.predicate !== 'name') {
            result.push('name');
        }
        return result;
    }

    getBrokerType() {
        this.topicService.getBrokers().subscribe(
            data => {
                if (data) {
                    for (let i = 0; i < data.body.length; i++) {
                        this.brokers.push(data.body[i]);
                    }
                    this.brokerType = this.brokers[0].type;
                    this.getAllTopics();
                }
            },
            error => console.log(error)
        );
    }

    getAllTopics() {
        this.addresses = [];

        this.topicService.getAllTopics(this.brokerType).subscribe(
            data => {
                if (data) {
                    for (let address of data.body.topics.topic) {
                        this.addresses.push(address);
                    }
                }
            },
            error => console.log(error)
        );
    }
}
