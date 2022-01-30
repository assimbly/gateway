import { Component, OnInit, OnDestroy } from '@angular/core';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';

import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderService } from './header.service';
import { Subscription } from 'rxjs';
import { IHeader } from 'app/shared/model/header.model';
import { AccountService } from 'app/core';

@Component({
    selector: 'jhi-header-all',
    templateUrl: './header-all.component.html'
})
export class HeaderAllComponent implements OnInit, OnDestroy {
    public headers: IHeader[] = [];
    public page: any;
    public isAdmin: boolean;
    private eventSubscriber: Subscription;
    private currentAccount: any;
    predicate: any;
    reverse: any;

    constructor(
        protected headerService: HeaderService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {
        this.page = 0;
        this.predicate = 'name';
        this.reverse = true;
    }

    ngOnInit() {
        this.loadAllHeaders();
        this.registerChangeInHeaders();
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'name') {
            result.push('name');
        }
        return result;
    }

    reset() {
        this.page = 0;
        this.headers = [];
        this.loadAllHeaders();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    private loadAllHeaders() {
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.isAdmin = this.accountService.isAdmin();
        this.headerService
            .query({
                page: this.page,
                sort: this.sort()
            })
            .subscribe(
                res => {
                    this.headers = res.body;
                },
                res => this.onError(res.body)
            );
    }

    private registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe('headerListModification', () => this.loadAllHeaders());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
