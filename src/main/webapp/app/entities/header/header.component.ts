import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IHeader } from 'app/shared/model/header.model';
import { AccountService } from 'app/core';
import { HeaderService } from './header.service';

@Component({
    selector: 'jhi-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
    headers: IHeader[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected headerService: HeaderService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.headerService.query().subscribe(
            (res: HttpResponse<IHeader[]>) => {
                this.headers = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInHeaders();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IHeader) {
        return item.id;
    }

    registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe('headerListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
