import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ITopic } from 'app/shared/model/topic.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { TopicService } from './topic.service';
import { TopicDeleteDialogComponent } from './topic-delete-dialog.component';

@Component({
    selector: 'jhi-topic',
    templateUrl: './topic.component.html'
})
export class TopicComponent implements OnInit, OnDestroy {
    topics: ITopic[];
    eventSubscriber?: Subscription;
    itemsPerPage: number;
    links: any;
    page: number;
    predicate: string;
    ascending: boolean;

    constructor(
        protected topicService: TopicService,
        protected eventManager: JhiEventManager,
        protected modalService: NgbModal,
        protected parseLinks: JhiParseLinks
    ) {
        this.topics = [];
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 0;
        this.links = {
            last: 0
        };
        this.predicate = 'id';
        this.ascending = true;
    }

    loadAll(): void {
        this.topicService
            .query({
                page: this.page,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe((res: HttpResponse<ITopic[]>) => this.paginateTopics(res.body, res.headers));
    }

    reset(): void {
        this.page = 0;
        this.topics = [];
        this.loadAll();
    }

    loadPage(page: number): void {
        this.page = page;
        this.loadAll();
    }

    ngOnInit(): void {
        this.loadAll();
        this.registerChangeInTopics();
    }

    ngOnDestroy(): void {
        if (this.eventSubscriber) {
            this.eventManager.destroy(this.eventSubscriber);
        }
    }

    trackId(index: number, item: ITopic): number {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return item.id!;
    }

    registerChangeInTopics(): void {
        this.eventSubscriber = this.eventManager.subscribe('topicListModification', () => this.reset());
    }

    delete(topic: ITopic): void {
        const modalRef = this.modalService.open(TopicDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.topic = topic;
    }

    sort(): string[] {
        const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    protected paginateTopics(data: ITopic[] | null, headers: HttpHeaders): void {
        const headersLink = headers.get('link');
        this.links = this.parseLinks.parse(headersLink ? headersLink : '');
        if (data) {
            for (let i = 0; i < data.length; i++) {
                this.topics.push(data[i]);
            }
        }
    }
}
