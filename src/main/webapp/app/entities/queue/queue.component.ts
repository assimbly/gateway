import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IQueue } from 'app/shared/model/queue.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { QueueService } from './queue.service';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';

@Component({
    selector: 'jhi-queue',
    templateUrl: './queue.component.html'
})
export class QueueComponent implements OnInit, OnDestroy {
    queues: IQueue[];
    eventSubscriber?: Subscription;
    itemsPerPage: number;
    links: any;
    page: number;
    predicate: string;
    ascending: boolean;

    constructor(
        protected queueService: QueueService,
        protected eventManager: JhiEventManager,
        protected modalService: NgbModal,
        protected parseLinks: JhiParseLinks
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
        this.queueService
            .query({
                page: this.page,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe((res: HttpResponse<IQueue[]>) => this.paginateQueues(res.body, res.headers));
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
}
