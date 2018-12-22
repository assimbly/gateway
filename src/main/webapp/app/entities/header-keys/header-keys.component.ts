import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IHeaderKeys } from 'app/shared/model/header-keys.model';
import { AccountService } from 'app/core';
import { HeaderKeysService } from './header-keys.service';

@Component({
    selector: 'jhi-header-keys',
    templateUrl: './header-keys.component.html'
})
export class HeaderKeysComponent implements OnInit, OnDestroy {
    headerKeys: IHeaderKeys[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected headerKeysService: HeaderKeysService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.headerKeysService.query().subscribe(
            (res: HttpResponse<IHeaderKeys[]>) => {
                this.headerKeys = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInHeaderKeys();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IHeaderKeys) {
        return item.id;
    }

    registerChangeInHeaderKeys() {
        this.eventSubscriber = this.eventManager.subscribe('headerKeysListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
